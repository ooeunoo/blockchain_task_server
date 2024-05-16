import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@libs/helper/encodeDecode';
import { DeFiAMM } from '../defi-amm';
import { DeFiBase } from '../defi-base';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { isNullBytes } from '@libs/helper/type';
import { AbiService } from '../../abi/abi.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { INFO } from './wault-swap.constant';
import { DeFiFarm } from '../defi-farm';
import { Farm } from '../../../libs/repository/src/farm/entity';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '../../../libs/helper/src/array';
import { ZERO } from '../../../libs/helper/src/constant';
import { isZero } from '../../../libs/helper/src/bignumber';
import { divideDecimals } from '../../../libs/helper/src/decimals';

@Injectable()
export class WaultSwapBSCService extends DeFiFarm(DeFiAMM(DeFiBase)) {
  name = PROTOCOL.WAULT_SWAP;
  chainId = CHAIN_ID.BSC;
  constants = INFO[CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
  ) {
    super(
      networkService,
      protocolService,
      tokenService,
      abiService,
      interactionService,
    );
  }

  getWalletFarms(farms: Farm[], walletAddress: string): Promise<any> {
    return this.getFarmWalletInfo(farms, walletAddress);
  }

  getWalletAMMs(walletAddress: string): Promise<any> {
    throw new Error('Method not implemented.');
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

  get ammFactoryAddress(): string {
    return this.constants.amm.factory_address;
  }

  get ammFactoryInitCodeHash(): string {
    return this.constants.amm.factory_init_code_hash;
  }

  get ammFactoryAbi(): any[] {
    return this.addressABI.get(this.ammFactoryAddress);
  }

  get ammFactoryContract(): Contract {
    const res = new ethers.Contract(
      this.ammFactoryAddress,
      this.ammFactoryAbi,
      this.provider,
    );
    return res;
  }

  getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  getFarmRewardPerBlock(): Promise<ethers.BigNumberish> {
    return this.farmContract.wexPerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accWexPerShare: BigNumber;
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

  async getAMMFactoryTotalLength(): Promise<BigNumber> {
    return this.ammFactoryContract.allPairsLength();
  }

  async getAMMFactoryInfos(pids: number[]): Promise<string[]> {
    const ammFactoryInfoEncode = pids.map((pid: number) => [
      this.ammFactoryAddress,
      encodeFunction(this.ammFactoryAbi, 'allPairs', [pid]),
    ]);

    const ammFactoryInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      ammFactoryInfoEncode,
    );

    return ammFactoryInfoBatchCall.map(({ success, returnData }) => {
      return success && !isNullBytes(returnData)
        ? decodeFunctionResultData(
            this.ammFactoryAbi,
            'allPairs',
            returnData,
          )[0]
        : [];
    });
  }

  async getFarmWalletInfo(farms: Farm[], walletAddress: string): Promise<any> {
    const walletInfoEncode = farms.map(({ pid }) => {
      return [
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'userInfo', [pid, walletAddress]),
        ],
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'pendingWex', [pid, walletAddress]),
        ],
      ];
    });

    const walletInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(walletInfoEncode),
    );

    const walletInfoBatchCallMap = toSplitWithChunkSize(walletInfoBatchCall, 2);

    const farmWalletInfoZip = zip(farms, walletInfoBatchCallMap);

    const output = [];
    farmWalletInfoZip.forEach(([farm, walletInfoResult]) => {
      const { stake_tokens, reward_tokens } = farm;

      const [
        { success: walletInfoSuccess, returnData: walletInfoData },
        { success: pendingRewardSuccess, returnData: pendingRewardData },
      ] = walletInfoResult;

      const walletStakedAmount = validResult(walletInfoSuccess, walletInfoData)
        ? decodeFunctionResultData(this.farmAbi, 'userInfo', walletInfoData)
            .amount
        : ZERO;

      const walletRewardAmount = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farmAbi,
            'pendingWex',
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
