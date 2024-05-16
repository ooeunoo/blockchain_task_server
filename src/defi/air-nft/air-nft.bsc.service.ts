import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { DeFiBase } from '../defi-base';
import { DeFiNFT } from '../defi-nft';
import { INFO } from './air-nft.constant';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import {
  getBatchERC721TokenInfos,
  getBatchStaticAggregator,
  getSafeERC721BalanceOf,
} from '@libs/helper/batch-contract';
import { fillSequenceNumber, flat, removeNull } from '@libs/helper/array';
import { isNullBytes } from '@libs/helper/type';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { InteractionService } from '../../interaction/interaction.service';
import { NFTokenService } from '../../nf-token/nf-token.service';
import { NetworkService } from '../../network/network.service';
import { AbiService } from '../../abi/abi.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { isZero } from '../../../libs/helper/src/bignumber';
import { NFTokenSearchQuery } from '../../nf-token/nf-token.dto';
import { NFToken } from '../../../libs/repository/src/nf-token/entity';

@Injectable()
export class AirNftBSCService extends DeFiNFT(DeFiBase) {
  name = PROTOCOL.AIR_NFT;
  chainId = CHAIN_ID.BSC;
  constants = INFO[CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
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
