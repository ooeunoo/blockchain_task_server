import { BigNumber } from '@ethersproject/bignumber';
import { Injectable } from '@nestjs/common';
import { InteractionService } from '../interaction/interaction.service';
import { NetworkService } from '../network/network.service';
// import { TokenSearchQuery } from '../token/token.dto';
import { Token } from '@libs/repository/token/entity';
import { TokenService } from '../token/token.service';
import { DefiService } from '../defi/defi.service';
import { FarmInfoItem, TokenBalanceItem } from './wallet.dto';
import { FarmSearchQuery } from '../farm/farm.dto';
import { ProtocolService } from '../protocol/protocol.service';
import { FarmService } from '../farm/farm.service';
import { NFTokenSearchQuery } from '../nf-token/nf-token.dto';
import { NFTokenService } from '../nf-token/nf-token.service';
import { LendingService } from '../lending/lending.service';
import { LendingSearchQuery } from '../lending/lending.dto';
import { flat, groupBy, zip } from '@libs/helper/array';
import { getBatchERC20TokenBalances } from '@libs/helper/batch-contract';
import { isZero } from '@libs/helper/bignumber';
import { divideDecimals } from '@libs/helper/decimals';
import { isEmpty } from '@libs/helper/object';
import { IDeFiFarm, IDeFiLending, IDeFiNFT } from '../defi/defi.interface';
import { In } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    private readonly networkService: NetworkService,
    private readonly tokenService: TokenService,
    private readonly interactionService: InteractionService,
    private readonly protocolService: ProtocolService,
    private readonly farmService: FarmService,
    private readonly nfTokenService: NFTokenService,
    private readonly lendingService: LendingService,
    private readonly defiService: DefiService,
  ) {}

  /**
   * 지갑 토큰 잔액 조회
   * @param walletAddress 지갑 주소
   * @param params token search query params
   * @returns TokenBalanceItem
   */
  async getWalletTokenBalances(
    walletAddress: string,
    params?: any,
  ): Promise<TokenBalanceItem[]> {
    const interactedWithAddresses =
      await this.interactionService.findInteractionAddresses({
        from_address: walletAddress,
      });

    if (interactedWithAddresses.length === 0) return [];

    const items = await this.tokenService.search({
      ...params,
      addresses: interactedWithAddresses,
    });

    if (items.length === 0) return [];

    const interactedTokensGroupByChainId = groupBy(items, 'network.chain_id');

    const result = await Promise.all(
      Object.keys(interactedTokensGroupByChainId).map(
        async (chainId: string) => {
          const output = [];
          const provider = this.networkService.provider(Number(chainId));
          const multiCallAddress = this.networkService.multiCallAddress(
            Number(chainId),
          );

          const tokens = interactedTokensGroupByChainId[chainId];
          const tokensAddresses = tokens.map(({ address }) => address);

          const tokenBalances = await getBatchERC20TokenBalances(
            provider,
            multiCallAddress,
            [walletAddress],
            tokensAddresses,
          );

          const tokenWithBalanceZip = zip(tokens, tokenBalances);

          tokenWithBalanceZip.forEach(
            ([token, balance]: [token: Token, balance: BigNumber]) => {
              if (isZero(balance)) return;

              const format = {
                ...token,
                wallet: {
                  balance: divideDecimals(balance, token.decimals).toString(),
                },
              };
              output.push(format);
            },
          );
          return output;
        },
      ),
    );

    return flat(result);
  }

  /**
   * 지갑 이자 농사 조회
   * @param walletAddress 지갑 주소
   * @param params farm search query params
   * @returns FarmInfoItem
   */
  async getWalletFarmInfos(
    walletAddress: string,
    params?: FarmSearchQuery,
  ): Promise<FarmInfoItem[]> {
    const distinctFarmAddress: string[] = await this.farmService.searchDistinct(
      params,
      'farm.address',
    );

    const interactions = await this.interactionService.findInteractionAddresses(
      {
        from_address: walletAddress,
        to_address: In(distinctFarmAddress),
      },
    );

    if (interactions.length == 0) return [];

    const farms = await this.farmService.search({
      ...params,
      addresses: interactions,
    });

    if (farms.length == 0) return [];

    const groupFarmByProtocolId = groupBy(farms, 'protocol.id');

    const output = [];

    await Promise.all(
      Object.keys(groupFarmByProtocolId).map(async (id) => {
        console.log(id);
        const service: IDeFiFarm = this.defiService.getService(Number(id));
        const farms = groupFarmByProtocolId[id];

        const walletFarmInfo = await service.getWalletFarms(
          farms,
          walletAddress,
        );

        if (walletFarmInfo.length > 0) {
          output.push(walletFarmInfo);
        }
      }),
    );

    return output;
  }

  /**
   * 지갑이 보유한 NFT 정보 조회
   * @param walletAddress 지갑 주소
   * @param params nftoken search query
   * @returns
   */
  async getWalletNFTokenInfos(
    walletAddress: string,
    params?: NFTokenSearchQuery,
  ) {
    let protocolIds = [];

    if (!isEmpty(params)) {
      protocolIds = await this.nfTokenService.searchDistinct(
        params,
        'protocol_id',
      );
    } else {
      protocolIds = await this.protocolService.searchDistinct(
        {
          useNFT: true,
        },
        'protocol.id',
      );
    }

    const services = protocolIds.map((id) =>
      this.defiService.getService(Number(id)),
    );

    const result = await Promise.all(
      services.map((service: IDeFiNFT) =>
        service.getWalletNFTokens(walletAddress, params),
      ),
    );

    if (result.length == 0) return [];
    return flat(result);
  }

  async getWalletLendingInfos(
    walletAddress: string,
    params?: LendingSearchQuery,
  ) {
    let protocolIds = [];

    if (!isEmpty(params)) {
      protocolIds = await this.lendingService.searchDistinct(
        params,
        'protocol_id',
      );
    } else {
      protocolIds = await this.protocolService.searchDistinct(
        {
          useLending: true,
        },
        'protocol.id',
      );
    }

    const services = protocolIds.map((id) =>
      this.defiService.getService(Number(id)),
    );

    const result = await Promise.all(
      services.map((service: IDeFiLending) =>
        service.getWalletLendings(walletAddress, params),
      ),
    );

    if (result.length == 0) return [];
    return flat(result);
  }
}
