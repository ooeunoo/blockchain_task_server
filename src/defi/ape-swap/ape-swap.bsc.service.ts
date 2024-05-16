import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { BigNumber, Contract, ethers } from 'ethers';
import { DeFiAMM } from '../defi-amm';
import { DeFiBase } from '../defi-base';
import { DeFiFarm } from '../defi-farm';
import { Farm } from '@libs/repository/farm/entity';
import { isNullBytes } from '@libs/helper/type';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import {
  getBatchERC721TokenInfos,
  getBatchStaticAggregator,
  getSafeERC721BalanceOf,
} from '@libs/helper/batch-contract';
import {
  fillSequenceNumber,
  flat,
  removeNull,
  toSplitWithChunkSize,
  zip,
} from '@libs/helper/array';
import { ZERO } from '@libs/helper/constant';
import { isZero } from '@libs/helper/bignumber';
import { divideDecimals } from '@libs/helper/decimals';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { AbiService } from '../../abi/abi.service';
import { FarmService } from '../../farm/farm.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { INFO } from './ape-swap.constant';
import { NFTokenSearchQuery } from '../../nf-token/nf-token.dto';
import { NFToken } from '../../../libs/repository/src/nf-token/entity';
import { NFTokenService } from '../../nf-token/nf-token.service';
import { DeFiNFT } from '../defi-nft';

@Injectable()
export class ApeSwapBSCService extends DeFiFarm(DeFiNFT(DeFiAMM(DeFiBase))) {
  name = PROTOCOL.APE_SWAP;
  chainId = CHAIN_ID.BSC;
  constants = INFO[CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
    public readonly farmService: FarmService,
    public readonly nfTokenService: NFTokenService,
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

  async getWalletNFTokens(walletAddress: string, params?: any): Promise<any> {
    const interactions = await this.interactionService.findInteractionAddresses(
      {
        network: this.network,
        from_address: walletAddress,
        to_address: this.nfTokenAddress,
      },
    );

    if (interactions.length == 0) return [];

    const result = await Promise.all(
      interactions.map((address) => {
        switch (address) {
          case this.nfTokenAddress:
            return this.getNFTokenWalletInfo(walletAddress, params);
        }
      }),
    );

    return flat(result);
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

  get nfTokenAddress(): string {
    return this.constants.nf_token.address;
  }

  get nfTokenAbi(): any[] {
    return this.addressABI.get(this.nfTokenAddress);
  }

  get nfTokenContract(): Contract {
    return new ethers.Contract(
      this.nfTokenAddress,
      this.nfTokenAbi,
      this.provider,
    );
  }

  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmRewardPerBlock(): Promise<BigNumber> {
    return this.farmContract.cakePerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accCakePerShare: BigNumber;
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
        : [];
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

  async getNFTokenTotalSupply(): Promise<BigNumber> {
    return this.nfTokenContract.totalSupply();
  }

  async getNFTokenInfos(pids: number[]): Promise<
    {
      id: BigNumber;
      owner: string;
      tokenURI: string;
    }[]
  > {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfTokenAddress,
      pids,
    );
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
          encodeFunction(this.farmAbi, 'pendingCake', [pid, walletAddress]),
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
              'pendingCake',
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

  async getNFTokenWalletInfo(
    walletAddress: string,
    params: NFTokenSearchQuery,
  ): Promise<NFToken[]> {
    const balanceOfWallet = await getSafeERC721BalanceOf(
      this.provider,
      this.multiCallAddress,
      this.nfTokenAddress,
      walletAddress,
    );

    if (isZero(balanceOfWallet)) return [];

    const sequenceIndex = fillSequenceNumber(balanceOfWallet);

    const tokenOfOwnerByIndexEncode = sequenceIndex.map((index: number) => [
      this.nfTokenAddress,
      encodeFunction(this.nfTokenAbi, 'tokenOfOwnerByIndex', [
        walletAddress,
        index,
      ]),
    ]);

    const tokenOfOwnerByIndexBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      tokenOfOwnerByIndexEncode,
    );

    const tokenOfOwnerByIndexDecode = tokenOfOwnerByIndexBatchCall.map(
      ({ success, returnData }) => {
        return success && !isNullBytes(returnData)
          ? decodeFunctionResultData(
              this.nfTokenAbi,
              'tokenOfOwnerByIndex',
              returnData,
            )[0]
          : null;
      },
    );

    const tokenOfOwnerByIndex = removeNull(tokenOfOwnerByIndexDecode);

    const walletNFTInfos = await this.nfTokenService.search({
      ...params,
      protocolId: this.protocol.id,
      address: this.nfTokenAddress,
      indexes: tokenOfOwnerByIndex.map((index) => index.toString()),
    });

    return walletNFTInfos;
  }
}
