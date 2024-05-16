import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { API_PATH } from './farm.constant';
import { FarmService } from './farm.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  /**
   * Farm 조회 (pagination)
   * @param query FarmSearchQuery
   * @returns FarmSearchItem
   */
  @ApiResponse({
    status: 200,
    description: 'Search farm result',
    // type: FarmSearchItem,
  })
  @Get(API_PATH.SEARCH)
  async searchFarms(@Query(PaginationPipe) query: any): Promise<any> {
    return this.farmService.search(query);
  }
}
