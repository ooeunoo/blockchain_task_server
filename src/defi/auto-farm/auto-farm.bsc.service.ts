import { Injectable } from '@nestjs/common';
import { ethers, Contract, BigNumber } from 'ethers';
import { In } from 'typeorm';
import { DeFiBase } from '../defi-base';
import { DeFiFarm } from '../defi-farm';
import { Farm } from '@libs/repository/farm/entity';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { isNullBytes } from '@libs/helper/type';
import { flat, toSplitWithChunkSize, zip } from '@libs/helper/array';
import { ZERO } from '@libs/helper/constant';
import { isZero } from '@libs/helper/bignumber';
import { divideDecimals } from '@libs/helper/decimals';
import { FarmService } from '../../farm/farm.service';
import { AbiService } from '../../abi/abi.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { INFO } from './auto-farm.constant';

@Injectable()
export class AutoFarmBSCService extends DeFiFarm(DeFiBase) {
  name = PROTOCOL.AUTO_FARM;
  chainId = CHAIN_ID.BSC;
  constants = INFO[CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
    public readonly farmService: FarmService,
  ) {
    super(
      networkService,
      protocolService,
      tokenService,
      abiService,
      interactionService,
    );
  }

  async getWalletFarms(farms: Farm[], walletAddress: string): Promise<any> {
    return this.getFarmWalletInfo(farms, walletAddress);
  }

  get farmName(): string {
    return this.constants.farm.name;
  }

  get farmAddress(): string {
    return this.constants.farm.address;
  }

  get farmAbi(): any[] {
    return this.addressABI.get(this.farmAddress);
  }

  get farmContract(): Contract {
    return new ethers.Contract(this.farmAddress, this.farmAbi, this.provider);
  }

  get farmStratName(): string {
    return this.constants.farm_strat.name;
  }

  get farmStratSampleAddress(): string {
    return this.constants.farm_strat.sample_address;
  }

  get farmStratAbi(): any[] {
    return this.addressABI.get(this.farmStratSampleAddress);
  }

  farmStratContract(address: string): Contract {
    return new ethers.Contract(address, this.farmStratAbi, this.provider);
  }

  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmRewardPerBlock(): Promise<BigNumber> {
    return this.farmContract.AUTOPerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      want: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accAUTOPerShare: BigNumber;
      strat: string;
    }[]
  > {
    const farmInfoEncode = pids.map((pid: number) => [
      this.farmAddress,
      encodeFunction(this.farmAbi, 'poolInfo', [pid]),
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmInfoEncode,
    );

    return farmInfoBatchCall.map(({ success, returnData }) => {
      return success && !isNullBytes(returnData)
        ? decodeFunctionResultData(this.farmAbi, 'poolInfo', returnData)
        : null;
    });
  }

  async getFarmStratShareTotal(address: string): Promise<BigNumber> {
    return this.farmStratContract(address).sharesTotal();
  }

  async getFarmWalletInfo(farms: Farm[], walletAddress: string) {
    const walletInfoEncode = farms.map(({ pid }) => {
      return [
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'userInfo', [pid, walletAddress]),
        ],
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'pendingAUTO', [pid, walletAddress]),
        ],
      ];
    });

    const walletInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(walletInfoEncode),
    );

    const walletInfoBatchCallMap: any[] = toSplitWithChunkSize(
      walletInfoBatchCall,
      2,
    );

    const farmWalletInfoZip = zip(farms, walletInfoBatchCallMap);

    const output = [];
    farmWalletInfoZip.forEach(([farm, walletInfoResult]) => {
      const { stake_tokens, reward_tokens } = farm;

      const [
        { success: walletInfoSuccess, returnData: walletInfoData },
        { success: pendingRewardSuccess, returnData: pendingRewardData },
      ] = walletInfoResult;

      const walletStakedAmount =
        walletInfoSuccess && !isNullBytes(walletInfoData)
          ? decodeFunctionResultData(this.farmAbi, 'userInfo', walletInfoData)
              .shares
          : ZERO;

      const walletRewardAmount =
        pendingRewardSuccess && !isNullBytes(pendingRewardData)
          ? decodeFunctionResultData(
              this.farmAbi,
              'pendingAUTO',
              pendingRewardData,
            )
          : ZERO;

      if (isZero(walletStakedAmount) && isZero(walletRewardAmount)) {
        return;
      }

      const targetStakeToken = stake_tokens[0];
      const targetRewardToken = reward_tokens[0];

      const stake_amount = divideDecimals(
        walletStakedAmount,
        targetStakeToken.decimals,
      );

      const reward_amount = divideDecimals(
        walletRewardAmount,
        targetRewardToken.decimals,
      );

      if (isZero(stake_amount) && isZero(reward_amount)) {
        return;
      }

      farm.wallet = {
        stake_amount: [stake_amount],
        reward_amount: [reward_amount],
      };

      output.push(farm);
    });
    return output;
  }
}
