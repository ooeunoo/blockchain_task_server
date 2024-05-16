import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { API_PATH } from './lending.constant';
import { LendingSearchQuery } from './lending.dto';
import { LendingService } from './lending.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class LendingController {
  constructor(private readonly lendingService: LendingService) {}

  /**
   * Lending 조회 (pagination)
   * @param query LendingSearchQuery
   * @returns Lending search result
   */
  @ApiResponse({
    status: 200,
    description: 'Search lending result',
  })
  @Get(API_PATH.SEARCH)
  async searchLendings(
    @Query(PaginationPipe) query: LendingSearchQuery,
  ): Promise<any> {
    return this.lendingService.search(query);
  }
}
