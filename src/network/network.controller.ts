import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { API_PATH } from './network.constant';
import { NetworkSearchQuery } from './network.dto';
import { NetworkService } from './network.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  /**
   * network 조회 (pagination)
   * @param query NetworkSearchQuery
   * @returns Network search result
   */
  @ApiResponse({
    status: 200,
    description: 'Search network result',
  })
  @Get(API_PATH.SEARCH)
  async searchNetworks(
    @Query(PaginationPipe) query: NetworkSearchQuery,
  ): Promise<any> {
    return this.networkService.search(query);
  }
}
