import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { isNullBytes } from '@libs/helper/type';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { AbiService } from '../../abi/abi.service';
import { FarmService } from '../../farm/farm.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { DeFiAMM } from '../defi-amm';
import { DeFiBase } from '../defi-base';
import { DeFiFarm } from '../defi-farm';
import { INFO } from './mdex.constant';
import { In } from 'typeorm';
import { Farm } from '@libs/repository/farm/entity';
import { flat, toSplitWithChunkSize, zip } from '@libs/helper/array';
import { ZERO } from '@libs/helper/constant';
import { add, isZero } from '@libs/helper/bignumber';
import { divideDecimals } from '@libs/helper/decimals';

@Injectable()
export class MdexBSCService extends DeFiFarm(DeFiAMM(DeFiBase)) {
  name = PROTOCOL.MDEX;
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

  async getWalletAMMs(walletAddress: string): Promise<any> {
    return;
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
    return new ethers.Contract(
      this.ammFactoryAddress,
      this.ammFactoryAbi,
      this.provider,
    );
  }

  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmIsMultiLP(address: string): Promise<boolean> {
    return this.farmContract.isMultiLP(address);
  }

  async getFarmHalvingPeriod(): Promise<BigNumber> {
    return this.farmContract.halvingPeriod();
  }

  async getFarmPhase(blockNumber: any): Promise<any> {
    return this.farmContract.phase(blockNumber);
  }

  async getFarmStartBlock(): Promise<any> {
    return this.farmContract.startBlock();
  }

  async getFarmReward(blockNumber: any): Promise<any> {
    return this.farmContract.reward(blockNumber);
  }

  // https://bscscan.com/address/0xc48fe252aa631017df253578b1405ea399728a50#code L975, L1023 (해빙기 적용)
  async getFarmRewardPerBlock(): Promise<BigNumberish> {
    return this.farmContract.mdxPerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accMdxPerShare: BigNumber;
      accMultiLpPerShare: BigNumber;
      totalAmount: BigNumber;
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

  async getFarmWalletInfo(farms: Farm[], walletAddress: string) {
    const walletInfoEncode = farms.map(({ pid }) => {
      return [
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'userInfo', [pid, walletAddress]),
        ],
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'pending', [pid, walletAddress]),
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
              .amount
          : ZERO;

      const walletRewardAmount =
        pendingRewardSuccess && !isNullBytes(pendingRewardData)
          ? decodeFunctionResultData(
              this.farmAbi,
              'pending',
              pendingRewardData,
            )[0]
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
