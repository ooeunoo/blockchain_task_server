import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';
import { PaginationRequest } from '../app/pagination/pagination.request';

export class NetworkSearchQuery extends PaginationRequest {
  @ApiProperty({
    description: 'search through network  id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  id?: number;
}
