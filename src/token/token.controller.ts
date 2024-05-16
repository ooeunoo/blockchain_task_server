import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { API_PATH } from './token.constant';
import { TokenSearchQuery } from './token.dto';
import { TokenService } from './token.service';

@ApiTags('token')
@Controller(API_PATH.ROOT)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Token 조회 (pagination)
   * @param query TokenSearchQuery
   * @returns Token search result
   */
  @ApiResponse({
    status: 200,
    description: 'Search token result',
  })
  @Get(API_PATH.SEARCH)
  async searchTokens(
    @Query(PaginationPipe) query: TokenSearchQuery,
  ): Promise<any> {
    return this.tokenService.search(query);
  }
}
