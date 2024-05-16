import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '../app/pagination/pagination.pipe';
import { API_PATH } from './protocol.constant';
import { ProtocolSearchQuery } from './protocol.dto';
import { ProtocolService } from './protocol.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class ProtocolController {
  constructor(private readonly protocolService: ProtocolService) {}

  /**
   * Protocol 조회 (pagination)
   * @param query ProtocolSearchQuery
   * @returns Protocol search item
   */
  @ApiResponse({
    status: 200,
    description: 'Search protocol result',
  })
  @Get(API_PATH.SEARCH)
  async searchProtocols(
    @Query(PaginationPipe) query: ProtocolSearchQuery,
  ): Promise<any> {
    return this.protocolService.search(query);
  }
}
