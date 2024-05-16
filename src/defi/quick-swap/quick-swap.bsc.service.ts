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
import { INFO } from './quick-swap.constant';
import { DeFiFarm } from '../defi-farm';
import { Farm } from '../../../libs/repository/src/farm/entity';
import { ZERO, ZERO_ADDRESS } from '../../../libs/helper/src/constant';
import { add } from '../../../libs/helper/src/bignumber';

@Injectable()
export class QuickSwapMATICService extends DeFiFarm(DeFiAMM(DeFiBase)) {
  name = PROTOCOL.QUICK_SWAP;
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

  getWalletFarms(farms: Farm[], walletAddress: string): Promise<any> {
    throw new Error('Method not implemented.');
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

  get farmStakingRewardSampleAddress(): string {
    return this.constants.farm_staking_reward.sample_address;
  }

  get farmStakingRewardAbi(): any[] {
    return this.addressABI.get(this.farmStakingRewardSampleAddress);
  }

  farmStakingRewardContract(address: string): Contract {
    return new ethers.Contract(
      address,
      this.farmStakingRewardAbi,
      this.provider,
    );
  }

  async getFarmTotalLength(): Promise<any> {
    let length = 0;
    try {
      while (true) {
        await this.farmContract.stakingTokens(length);
        length += 1;
      }
    } catch (e) {}
    return length;
  }

  getFarmTotalAllocPoint(): Promise<BigNumber> {
    return;
  }

  getFarmRewardPerBlock(): Promise<ethers.BigNumberish> {
    throw new Error('Method not implemented.');
  }

  async getFarmInfos(pids: number[]): Promise<any> {
    const farmStakingTokenEncode = pids.map((pid: number) => [
      this.farmAddress,
      encodeFunction(this.farmAbi, 'stakingTokens', [pid]),
    ]);

    const farmStakingTokenBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmStakingTokenEncode,
    );

    const farmStakingTokens = farmStakingTokenBatchCall.map(
      ({ success, returnData }) => {
        return validResult(success, returnData)
          ? decodeFunctionResultData(this.farmAbi, 'stakingTokens', returnData)
          : ZERO_ADDRESS;
      },
    );

    const farmStakingRewardsInfoByStakingTokenEncode = farmStakingTokens.map(
      (address: string) => [
        this.farmAddress,
        encodeFunction(this.farmAbi, 'stakingRewardsInfoByStakingToken', [
          address,
        ]),
      ],
    );

    const farmStakingRewardsInfoByStakingTokenBatchCall =
      await getBatchStaticAggregator(
        this.provider,
        this.multiCallAddress,
        farmStakingRewardsInfoByStakingTokenEncode,
      );

    const farmStakingRewardsInfoByStakingToken =
      farmStakingRewardsInfoByStakingTokenBatchCall.map(
        ({ success, returnData }) => {
          return validResult(success, returnData)
            ? decodeFunctionResultData(
                this.farmAbi,
                'stakingRewardsInfoByStakingToken',
                returnData,
              ).stakingRewards
            : ZERO_ADDRESS;
        },
      );

    const farmInfoEncode = farmStakingRewardsInfoByStakingToken.map(
      (address: string) => {
        return [
          [address, encodeFunction(this.farmStakingRewardAbi, 'stakingToken')],
          [address, encodeFunction(this.farmStakingRewardAbi, 'rewardTokenA')],
          [address, encodeFunction(this.farmStakingRewardAbi, 'rewardTokenB')],
          [address, encodeFunction(this.farmStakingRewardAbi, 'totalSupply')],
          [
            address,
            encodeFunction(this.farmStakingRewardAbi, 'rewardPerTokenA'),
          ],
          [
            address,
            encodeFunction(this.farmStakingRewardAbi, 'rewardPerTokenB'),
          ],
        ];
      },
    );
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

  getFarmWalletInfo(farms: Farm[], walletAddress: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
