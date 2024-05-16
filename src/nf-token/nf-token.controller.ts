import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { API_PATH } from './nf-token.constant';
import { NFTokenSearchQuery } from './nf-token.dto';
import { NFTokenService } from './nf-token.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class NFTokenController {
  constructor(private readonly nfTokenService: NFTokenService) {}

  /**
   * NFToken 조회 (pagination)
   * @param query NFTokenSearchQuery
   * @returns NFToken search result
   */
  @ApiResponse({
    status: 200,
    description: 'Search token result',
  })
  @Get(API_PATH.SEARCH)
  async searchNFTokens(
    @Query(PaginationPipe) query: NFTokenSearchQuery,
  ): Promise<any> {
    return this.nfTokenService.search(query);
  }
}
