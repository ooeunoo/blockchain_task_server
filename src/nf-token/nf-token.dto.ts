import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, Validate } from 'class-validator';
import { PaginationRequest } from '../app/pagination/pagination.request';

export class NFTokenSearchQuery extends PaginationRequest {
  @ApiProperty({
    description: 'search through nf token id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  id?: number;

  @ApiProperty({
    description: 'search through protocol id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  protocolId?: number;

  @ApiProperty({
    description: 'search through nf token index',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  index?: number;

  @ApiProperty({
    description: 'search through multiple nf token index',
    required: false,
  })
  @IsOptional()
  indexes?: number[];

  @ApiProperty({
    description: 'search through nf token address',
    required: false,
  })
  @IsOptional()
  address?: string;
}
