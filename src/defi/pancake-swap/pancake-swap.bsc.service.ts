import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import axios from 'axios';
import { DeFiAMM } from '../defi-amm';
import { DeFiFarm } from '../defi-farm';
import { DeFiBase } from '../defi-base';
import { Farm } from '@libs/repository/farm/entity';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { isZero } from '@libs/helper/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@libs/helper/encodeDecode';
import {
  getBatchERC721TokenInfos,
  getBatchStaticAggregator,
  getSafeERC721BalanceOf,
} from '@libs/helper/batch-contract';
import { isNullBytes } from '@libs/helper/type';
import {
  fillSequenceNumber,
  flat,
  removeNull,
  toSplitWithChunkSize,
  zip,
} from '@libs/helper/array';
import { ZERO } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { AbiService } from '../../abi/abi.service';
import { TokenService } from '../../token/token.service';
import { InteractionService } from '../../interaction/interaction.service';
import { FarmService } from '../../farm/farm.service';
import { INFO } from './pancake-swap.constant';
import { DeFiNFT } from '../defi-nft';
import { NFTokenService } from '../../nf-token/nf-token.service';
import { In } from 'typeorm';
import { NFTokenSearchQuery } from '../../nf-token/nf-token.dto';
import { NFToken } from '../../../libs/repository/src/nf-token/entity';

@Injectable()
export class PancakeSwapBSCService extends DeFiFarm(
  DeFiNFT(DeFiAMM(DeFiBase)),
) {
  name = PROTOCOL.PANCAKE_SWAP;
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

  /**
   * 유저의 스테이킹 Farm 정보 조회
   * @param address wallet address
   */
  async getWalletFarms(farms: Farm[], walletAddress: string): Promise<any> {
    const checkFarm = farms.filter((farm) => farm.name === this.farmName);
    const checkFarm2 = farms.filter((farm) => farm.name === this.farm2Name);

    const [farmWalletInfo, farm2WalletInfo] = await Promise.all([
      this.getFarmWalletInfo(checkFarm, walletAddress),
      this.getFarm2WalletInfo(checkFarm2, walletAddress),
    ]);

    return farmWalletInfo.concat(farm2WalletInfo);
  }

  /**
   * 유저의  AMM 정보 조회
   * @param walletAddress wallet address
   */
  async getWalletAMMs(walletAddress: string): Promise<any> {
    return [];
  }

  async getWalletNFTokens(walletAddress: string, params?: any): Promise<any> {
    const interactions = await this.interactionService.findInteractionAddresses(
      {
        network: this.network,
        from_address: walletAddress,
        to_address: In([
          this.nfTokenAddress,
          this.nfToken2Address,
          this.nfToken3Address,
          this.nfToken4Address,
          this.nfToken5Address,
        ]),
      },
    );

    if (interactions.length == 0) return [];

    const result = await Promise.all(
      interactions.map((address) => {
        switch (address.toLowerCase()) {
          case this.nfTokenAddress.toLowerCase():
            return this.getNFTokenWalletInfo(walletAddress, params);
          case this.nfToken2Address.toLowerCase():
            return this.getNFToken2WalletInfo(walletAddress, params);
          case this.nfToken3Address.toLowerCase():
            return this.getNFToken3WalletInfo(walletAddress, params);
          case this.nfToken4Address.toLowerCase():
            return this.getNFToken4WalletInfo(walletAddress, params);
          case this.nfToken5Address.toLowerCase():
            return this.getNFToken5WalletInfo(walletAddress, params);
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

  get farm2Name(): string {
    return this.constants.farm2.name;
  }

  get farm2Address(): string {
    return this.constants.farm2.address;
  }

  get farm2SampleAddress(): string {
    return this.constants.farm2.sample_address;
  }

  get farm2SubgraphUrl(): string {
    return this.constants.farm2.sub_graph_url;
  }

  get farm2Abi(): any[] {
    return this.addressABI.get(this.farm2SampleAddress);
  }

  farm2Contract(address: string): Contract {
    return new ethers.Contract(address, this.farm2Abi, this.provider);
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

  get ammRouterAddress(): string {
    return this.constants.amm.router_address;
  }

  get ammRouterAbi(): any[] {
    return this.addressABI.get(this.ammRouterAddress);
  }

  get ammRouterContract(): Contract {
    return new ethers.Contract(
      this.ammRouterAddress,
      this.ammRouterAbi,
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

  get nfToken2Address(): string {
    return this.constants.nf_token2.address;
  }

  get nfToken2Abi(): any[] {
    return this.addressABI.get(this.nfToken2Address);
  }

  get nfToken2Contract(): Contract {
    return new ethers.Contract(
      this.nfToken2Address,
      this.nfToken2Abi,
      this.provider,
    );
  }

  get nfToken3Address(): string {
    return this.constants.nf_token3.address;
  }

  get nfToken3Abi(): any[] {
    return this.addressABI.get(this.nfToken3Address);
  }

  get nfToken3Contract(): Contract {
    return new ethers.Contract(
      this.nfToken3Address,
      this.nfToken3Abi,
      this.provider,
    );
  }

  get nfToken4Address(): string {
    return this.constants.nf_token4.address;
  }

  get nfToken4Abi(): any[] {
    return this.addressABI.get(this.nfToken4Address);
  }

  get nfToken4Contract(): Contract {
    return new ethers.Contract(
      this.nfToken4Address,
      this.nfToken4Abi,
      this.provider,
    );
  }

  get nfToken5Address(): string {
    return this.constants.nf_token5.address;
  }

  get nfToken5Abi(): any[] {
    return this.addressABI.get(this.nfToken5Address);
  }

  get nfToken5Contract(): Contract {
    return new ethers.Contract(
      this.nfToken5Address,
      this.nfToken5Abi,
      this.provider,
    );
  }

  /**
   * 총 Farm 갯수
   * @returns Farm total length
   */
  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  /**
   * 총 Farm 할당 포인트
   * @returns Farm total alloc point
   */
  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  /**
   * Farm의 블록 당 리워드 수
   * @returns Farm reward per block
   */
  async getFarmRewardPerBlock(): Promise<BigNumber> {
    return this.farmContract.cakePerBlock();
  }

  /**
   * pid에 등록된 Farm 정보 조회 (node Call => 1 회)
   * @param pids farm's pid
   * @returns { lpToken: 스테이킹 토큰, allocPoint: 할당된 포인트, lastRewardBlock: 마지막 리워드 배분 블록 , accCakePerShare: 누산 리워드 }
   */
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
        : null;
    });
  }

  /**
   * 총 Farm2 갯수
   * @returns  Farm2 total length
   */
  async getFarm2TotalLength(): Promise<number> {
    const result: any = await axios.post(this.farm2SubgraphUrl, {
      query: `
        query smartChefFactory($smartChefAddress: String) {
          factory(id: $smartChefAddress) {
            totalSmartChef
          }
        }
      `,
      variables: {
        smartChefAddress: this.farm2Address.toLowerCase(),
      },
    });
    return result?.data?.data?.factory?.totalSmartChef;
  }

  /**
   * Farm2 정보 조회
   * @param totalLength Farm2 조회 갯수
   * @returns { id: farm2 주소, reward: 블록당 리워드, startBlock: 풀 시작 블록, endBlock: 풀 마감 블록, stakeToken: 스테이킹 토큰 정보, earnToken: 리워드 토큰 정보 }
   */
  async getFarm2Infos(totalLength: number): Promise<
    {
      id: string;
      reward: string;
      startBlock: string;
      endBlock: string;
      stakeToken: {
        id: string;
        name: string;
        decimals: string;
        symbol: string;
      };
      earnToken: {
        id: string;
        name: string;
        decimals: string;
        symbol: string;
      };
    }[]
  > {
    const result: any = await axios.post(this.farm2SubgraphUrl, {
      query: `query smartChefs($limit: Int!) {
        smartChefs(first: $limit) {
          id
          reward
          startBlock
          endBlock
          stakeToken {
            id
            name
            symbol
            decimals
          }
          earnToken {
            id
            name
            symbol
            decimals
          }
       
        }
      }`,
      variables: {
        limit: Number(totalLength),
      },
    });
    return result?.data?.data.smartChefs;
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

  async getNFTokenInfos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfTokenAddress,
      pids,
    );
  }

  async getNFToken2TotalSupply(): Promise<BigNumber> {
    return this.nfToken2Contract.totalSupply();
  }

  async getNFToken2Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken2Address,
      pids,
    );
  }

  async getNFToken3TotalSupply(): Promise<BigNumber> {
    return this.nfToken3Contract.totalSupply();
  }

  async getNFToken3Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken3Address,
      pids,
    );
  }

  async getNFToken4TotalSupply(): Promise<BigNumber> {
    return this.nfToken4Contract.totalSupply();
  }

  async getNFToken4Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken4Address,
      pids,
    );
  }

  async getNFToken5TotalSupply(): Promise<BigNumber> {
    return this.nfToken5Contract.totalSupply();
  }

  async getNFToken5Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken5Address,
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

  async getFarm2WalletInfo(farms: Farm[], walletAddress: string) {
    const walletInfoEncode = farms.map(({ address }) => {
      return [
        [address, encodeFunction(this.farm2Abi, 'userInfo', [walletAddress])],
        [
          address,
          encodeFunction(this.farm2Abi, 'pendingReward', [walletAddress]),
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

      const walletStakedAmount = validResult(walletInfoSuccess, walletInfoData)
        ? decodeFunctionResultData(this.farm2Abi, 'userInfo', walletInfoData)
            .amount
        : ZERO;

      const walletRewardAmount = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farm2Abi,
            'pendingReward',
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
        return validResult(success, returnData)
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

  async getNFToken2WalletInfo(
    walletAddress: string,
    params: NFTokenSearchQuery,
  ): Promise<NFToken[]> {
    const balanceOfWallet = await getSafeERC721BalanceOf(
      this.provider,
      this.multiCallAddress,
      this.nfToken2Address,
      walletAddress,
    );

    if (isZero(balanceOfWallet)) return [];

    const sequenceIndex = fillSequenceNumber(balanceOfWallet);

    const tokenOfOwnerByIndexEncode = sequenceIndex.map((index: number) => [
      this.nfToken2Address,
      encodeFunction(this.nfToken2Abi, 'tokenOfOwnerByIndex', [
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
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.nfToken2Abi,
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
      address: this.nfToken2Address,
      indexes: tokenOfOwnerByIndex.map((index) => index.toString()),
    });

    return walletNFTInfos;
  }

  async getNFToken3WalletInfo(
    walletAddress: string,
    params: NFTokenSearchQuery,
  ): Promise<NFToken[]> {
    const balanceOfWallet = await getSafeERC721BalanceOf(
      this.provider,
      this.multiCallAddress,
      this.nfToken3Address,
      walletAddress,
    );

    if (isZero(balanceOfWallet)) return [];

    const sequenceIndex = fillSequenceNumber(balanceOfWallet);

    const tokenOfOwnerByIndexEncode = sequenceIndex.map((index: number) => [
      this.nfToken3Address,
      encodeFunction(this.nfToken3Abi, 'tokenOfOwnerByIndex', [
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
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.nfToken3Abi,
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
      address: this.nfToken3Address,
      indexes: tokenOfOwnerByIndex.map((index) => index.toString()),
    });

    return walletNFTInfos;
  }

  async getNFToken4WalletInfo(
    walletAddress: string,
    params: NFTokenSearchQuery,
  ): Promise<NFToken[]> {
    const balanceOfWallet = await getSafeERC721BalanceOf(
      this.provider,
      this.multiCallAddress,
      this.nfToken4Address,
      walletAddress,
    );

    if (isZero(balanceOfWallet)) return [];

    const sequenceIndex = fillSequenceNumber(balanceOfWallet);

    const tokenOfOwnerByIndexEncode = sequenceIndex.map((index: number) => [
      this.nfToken4Address,
      encodeFunction(this.nfToken4Abi, 'tokenOfOwnerByIndex', [
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
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.nfToken4Abi,
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
      address: this.nfToken4Address,
      indexes: tokenOfOwnerByIndex.map((index) => index.toString()),
    });

    return walletNFTInfos;
  }

  async getNFToken5WalletInfo(
    walletAddress: string,
    params: NFTokenSearchQuery,
  ): Promise<NFToken[]> {
    const balanceOfWallet = await getSafeERC721BalanceOf(
      this.provider,
      this.multiCallAddress,
      this.nfToken5Address,
      walletAddress,
    );

    if (isZero(balanceOfWallet)) return [];

    const sequenceIndex = fillSequenceNumber(balanceOfWallet);

    const tokenOfOwnerByIndexEncode = sequenceIndex.map((index: number) => [
      this.nfToken5Address,
      encodeFunction(this.nfToken5Abi, 'tokenOfOwnerByIndex', [
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
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.nfToken5Abi,
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
      address: this.nfToken5Address,
      indexes: tokenOfOwnerByIndex.map((index) => index.toString()),
    });

    return walletNFTInfos;
  }
}
