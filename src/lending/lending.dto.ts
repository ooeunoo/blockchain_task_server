import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationRequest } from '../app/pagination/pagination.request';

export class LendingSearchQuery extends PaginationRequest {
  @ApiProperty({
    description: 'search through lending market id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  id?: number;

  @ApiProperty({
    description: 'search through multiple lending market id',
    required: false,
  })
  @IsOptional()
  ids?: number[];

  @ApiProperty({
    description: 'search through lending market id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  protocolId?: number;

  @ApiProperty({
    description: 'search through lending market address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'search through multiple lending market address',
    required: false,
  })
  @IsOptional()
  addresses?: string[];
}
