import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { FarmSearchQuery } from '../farm/farm.dto';
import { LendingSearchQuery } from '../lending/lending.dto';
import { NFTokenSearchQuery } from '../nf-token/nf-token.dto';
import { TokenSearchQuery } from '../token/token.dto';
import { API_PATH } from './wallet.constant';
import { WalletParams } from './wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Search wallet token balance
   * @param param wallet params { walletAddress }
   * @param query token search query
   * @returns wallet's token balances
   */
  @ApiResponse({
    description: 'wallet token balance',
    status: 200,
  })
  @Get(API_PATH.TOKEN)
  async getWalletTokenBalances(
    @Param() param: WalletParams,
    @Query(PaginationPipe) query: TokenSearchQuery,
  ): Promise<any> {
    const result = await this.walletService.getWalletTokenBalances(
      param.walletAddress,
      query,
    );

    return { itemCount: result.length, items: result };
  }

  /**
   * search wallet farm info
   * @param param wallet params { walletAddress }
   * @param query farm search query
   * @returns wallet's farm infos
   */
  @ApiResponse({
    description: 'wallet farm info',
    status: 200,
  })
  @Get(API_PATH.FARM)
  async getWalletFarmInfos(
    @Param() param: WalletParams,
    @Query(PaginationPipe) query: FarmSearchQuery,
  ): Promise<any> {
    const result = await this.walletService.getWalletFarmInfos(
      param.walletAddress,
      query,
    );
    return { itemCount: result.length, items: result };
  }

  /**
   * search wallet nftoken info
   * @param param wallet params { walletAddress }
   * @param query nf token search query
   * @returns wallet's nftoken infos
   */
  @ApiResponse({
    description: 'wallet nf token info',
    status: 200,
  })
  @Get(API_PATH.NFTOKEN)
  async getWalletNFTokenInfos(
    @Param() param: WalletParams,
    @Query(PaginationPipe) query: NFTokenSearchQuery,
  ): Promise<any> {
    const result = await this.walletService.getWalletNFTokenInfos(
      param.walletAddress,
      query,
    );

    return { itemCount: result.length, items: result };
  }

  /**
   * search wallet lending info
   * @param param wallet params { walletAddress }
   * @param query lending search query
   * @returns wallet's lending infos
   */
  @ApiResponse({
    description: 'wallet lending info',
    status: 200,
  })
  @Get(API_PATH.LENDING)
  async getWalletLendingInfos(
    @Param() param: WalletParams,
    @Query(PaginationPipe) query: LendingSearchQuery,
  ): Promise<any> {
    const result = await this.walletService.getWalletLendingInfos(
      param.walletAddress,
      query,
    );

    return { itemCount: result.length, items: result };
  }
}
