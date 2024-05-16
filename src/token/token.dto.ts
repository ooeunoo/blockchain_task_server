import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationRequest } from '../app/pagination/pagination.request';

export class TokenSearchQuery extends PaginationRequest {
  @ApiProperty({
    description: 'search through token id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  id?: number;

  @ApiProperty({
    description: 'search through token address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'search through multiple token address',
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  addresses?: string[];

  @ApiProperty({
    description: 'search through token symbol',
    required: false,
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiProperty({
    description: 'search through chain Id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  chainId?: number;
}
