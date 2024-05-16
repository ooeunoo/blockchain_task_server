import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { DeFiAMM } from '../defi-amm';
import { DeFiBase } from '../defi-base';
import { DeFiFarm } from '../defi-farm';
import { ZERO } from '@libs/helper/constant';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { flat, toSplitWithChunkSize, zip } from '@libs/helper/array';
import { isNull, isNullBytes } from '@libs/helper/type';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { Farm } from '@libs/repository/farm/entity';
import { FarmService } from '../../farm/farm.service';
import { AbiService } from '../../abi/abi.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { INFO } from './ape-swap.constant';
import { get } from '../../../libs/helper/src/object';
import { isZero } from '../../../libs/helper/src/bignumber';
import { divideDecimals } from '../../../libs/helper/src/decimals';

@Injectable()
export class ApeSwapMATICService extends DeFiFarm(DeFiAMM(DeFiBase)) {
  name = PROTOCOL.APE_SWAP;
  chainId = CHAIN_ID.MATIC;
  constants = INFO[CHAIN_ID.MATIC];

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

  async getWalletAMMs(): Promise<any> {
    return [];
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

  get farm2Name(): string {
    return this.constants.farm2.name;
  }

  get farm2Address(): string {
    return this.constants.farm2.address;
  }

  get farm2Abi(): any[] {
    return this.addressABI.get(this.farm2Address);
  }

  get farm2Contract(): Contract {
    return new ethers.Contract(this.farm2Address, this.farm2Abi, this.provider);
  }

  get farm2StratSampleAddress(): string {
    return this.constants.farm2_strat.sample_address;
  }

  get farm2StratAbi(): any[] {
    return this.addressABI.get(this.farm2StratSampleAddress);
  }

  farm2StratContract(address: string): Contract {
    return new ethers.Contract(address, this.farm2StratAbi, this.provider);
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

  async getFarmRewardPerBlock(): Promise<any> {
    return ZERO;
  }

  async getFarmRewardPerSecond(): Promise<BigNumber> {
    return this.farmContract.bananaPerSecond();
  }

  async getFarmRewarderRewardToken(address: string): Promise<string> {
    return this.farmRewarderContract(address).rewardToken();
  }

  async getFarmRewarderRewardPerSecond(address: string): Promise<BigNumber> {
    return this.farmRewarderContract(address).rewardPerSecond();
  }

  async getFarm2TotalLength(): Promise<BigNumber> {
    return this.farm2Contract.poolLength();
  }

  async getFarm2StratSharesTotal(address: string): Promise<BigNumber> {
    return this.farm2StratContract(address).sharesTotal();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      rewarder: string;
    }[]
  > {
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

  async getFarm2Infos(
    pids: number[],
  ): Promise<{ want: string; strat: string }> {
    const farmInfoEncode = pids.map((pid: number) => [
      this.farm2Address,
      encodeFunction(this.farm2Abi, 'poolInfo', [pid]),
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmInfoEncode,
    );

    return farmInfoBatchCall.map((result) => {
      const { success: poolInfoSuccess, returnData: poolInfoData } = result;

      const poolInfo =
        poolInfoSuccess && !isNullBytes(poolInfoData)
          ? decodeFunctionResultData(this.farm2Abi, 'poolInfo', poolInfoData)
          : null;

      return poolInfo;
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
          encodeFunction(this.farmAbi, 'pendingBanana', [pid, walletAddress]),
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

    await Promise.all(
      farmWalletInfoZip.map(async ([farm, walletInfoResult]) => {
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
                'pendingBanana',
                pendingRewardData,
              )
            : ZERO;

        const walletRewarderRewardAmount =
          rewarderPendingRewardSuccess &&
          !isNullBytes(rewarderPendingRewardData)
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
          await this.getFarmRewarderRewardToken(rewarder),
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
      }),
    );
    return output;
  }
}
