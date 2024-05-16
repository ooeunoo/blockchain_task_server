import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { DeFiAMM } from '../defi-amm';
import { DeFiBase } from '../defi-base';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { isNull, isNullBytes } from '@libs/helper/type';
import { AbiService } from '../../abi/abi.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { INFO } from './sushi-swap.constant';
import { DeFiFarm } from '../defi-farm';
import { Farm } from '../../../libs/repository/src/farm/entity';
import { ZERO } from '../../../libs/helper/src/constant';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '../../../libs/helper/src/array';
import { divideDecimals } from '../../../libs/helper/src/decimals';
import { isZero } from '../../../libs/helper/src/bignumber';
import { get } from '../../../libs/helper/src/object';
import { Token } from '../../../libs/repository/src/token/entity';

@Injectable()
export class SushiSwapMATICService extends DeFiFarm(DeFiAMM(DeFiBase)) {
  name = PROTOCOL.SUSHI_SWAP;
  chainId = CHAIN_ID.MATIC;
  constants = INFO[CHAIN_ID.MATIC];

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

  async getWalletFarms(farms: Farm[], walletAddress: string): Promise<any> {
    console.log('hrerererer');
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

  get farmRewarderName(): string {
    return this.constants.farm_rewarder.name;
  }

  get farmRewarderSampleAddress(): string {
    return this.constants.farm_rewarder.sample_address;
  }

  get farmRewarderAbi(): any[] {
    return this.addressABI.get(this.farmRewarderSampleAddress);
  }

  farmRewarderContract(address: string): Contract {
    return new ethers.Contract(address, this.farmRewarderAbi, this.provider);
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

  getFarmRewardPerBlock(): any {
    return ZERO;
  }

  getFarmRewardPerSecond(): Promise<BigNumber> {
    return this.farmContract.sushiPerSecond;
  }

  /**
   * https://polygonscan.com/address/0xa3378Ca78633B3b9b2255EAa26748770211163AE#code L:674 "private variable reward token"
   */
  getFarmRewarderRewardToken(address: string): string {
    return '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
  }

  getFarmRewarderRewardPerSecond(address: string): Promise<BigNumber> {
    return this.farmRewarderContract(address).rewardPerSecond();
  }

  async getFarmInfos(pids: number[]): Promise<any> {
    const farmInfoEncode = pids.map((pid: number) => [
      [this.farmAddress, encodeFunction(this.farmAbi, 'poolInfo', [pid])],
      [this.farmAddress, encodeFunction(this.farmAbi, 'lpToken', [pid])],
      [this.farmAddress, encodeFunction(this.farmAbi, 'rewarder', [pid])],
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 3);

    return farmInfoBatchCallMap.map((result) => {
      const [
        { success: poolInfoSuccess, returnData: poolInfoData },
        { success: lpTokenSuccess, returnData: lpTokenData },
        { success: rewarderSuccess, returnData: rewarderData },
      ] = result;

      const poolInfo =
        poolInfoSuccess && !isNullBytes(poolInfoData)
          ? decodeFunctionResultData(this.farmAbi, 'poolInfo', poolInfoData)
          : null;

      const lpToken =
        lpTokenSuccess && !isNullBytes(lpTokenData)
          ? decodeFunctionResultData(this.farmAbi, 'lpToken', lpTokenData)[0]
          : null;

      const rewarder =
        rewarderSuccess && !isNullBytes(rewarderData)
          ? decodeFunctionResultData(this.farmAbi, 'rewarder', rewarderData)[0]
          : null;

      if (isNull(poolInfo) || isNull(lpToken) || isNull(rewarder)) {
        return null;
      }

      return {
        allocPoint: poolInfo.allocPoint,
        lpToken,
        rewarder,
      };
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
    const walletInfoEncode = farms.map(({ pid, data }) => {
      return [
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'userInfo', [pid, walletAddress]),
        ],
        [
          this.farmAddress,
          encodeFunction(this.farmAbi, 'pendingSushi', [pid, walletAddress]),
        ],
        [
          get(JSON.parse(data), 'rewarder'),
          encodeFunction(this.farmRewarderAbi, 'pendingTokens', [
            pid,
            walletAddress,
            0,
          ]),
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
      3,
    );

    const farmWalletInfoZip = zip(farms, walletInfoBatchCallMap);

    const output = [];

    farmWalletInfoZip.forEach(([farm, walletInfoResult]) => {
      const { stake_tokens, reward_tokens, data } = farm;
      const rewarder = get(JSON.parse(data), 'rewarder');

      const [
        { success: walletInfoSuccess, returnData: walletInfoData },
        { success: pendingRewardSuccess, returnData: pendingRewardData },
        {
          success: rewarderPendingRewardSuccess,
          returnData: rewarderPendingRewardData,
        },
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
              'pendingSushi',
              pendingRewardData,
            )
          : ZERO;

      const walletRewarderRewardAmount =
        rewarderPendingRewardSuccess && !isNullBytes(rewarderPendingRewardData)
          ? decodeFunctionResultData(
              this.farmRewarderAbi,
              'pendingTokens',
              rewarderPendingRewardData,
            ).rewardAmounts
          : ZERO;

      if (
        isZero(walletStakedAmount) &&
        isZero(walletRewardAmount) &&
        isZero(walletRewarderRewardAmount)
      ) {
        return;
      }

      farm.reward_tokens = this.sortByRewardTokens(farm.reward_tokens, [
        this.token.address,
        this.getFarmRewarderRewardToken(rewarder),
      ]);

      const targetStakeToken = stake_tokens[0];
      const targetRewardToken = reward_tokens[0];
      const targetRewarderRewardToken = reward_tokens[1];

      const stake_amount = divideDecimals(
        walletStakedAmount,
        targetStakeToken.decimals,
      );

      const reward_amount = divideDecimals(
        walletRewardAmount,
        targetRewardToken.decimals,
      );

      const rewarder_reward_amount = divideDecimals(
        walletRewarderRewardAmount,
        targetRewarderRewardToken.decimals,
      );

      if (
        isZero(stake_amount) &&
        isZero(reward_amount) &&
        isZero(rewarder_reward_amount)
      ) {
        return;
      }

      farm.wallet = {
        stake_amount: [stake_amount],
        reward_amount: [reward_amount, rewarder_reward_amount],
      };

      output.push(farm);
    });
    return output;
  }
}
