import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationRequest } from '../app/pagination/pagination.request';
import { TokenType } from '@libs/repository/token/constant';

export class FarmSearchQuery extends PaginationRequest {
  @ApiProperty({
    description: 'search through farm id',
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
    description: 'search through  farm address',
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  address?: string;

  @ApiProperty({
    description: 'search through multiple farm address',
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  addresses?: string[];

  @ApiProperty({
    description: 'search through stake token type',
    required: false,
    enum: TokenType,
  })
  @IsOptional()
  @IsEnum(TokenType)
  stakeTokenType?: TokenType;

  @ApiProperty({
    description: 'search through reward token type',
    required: false,
    enum: TokenType,
  })
  @IsOptional()
  @IsEnum(TokenType)
  rewardTokenType?: TokenType;

  @ApiProperty({
    description: 'search through similar stake tokens symbol',
    required: false,
  })
  @IsOptional()
  @IsString()
  stakeTokenSymbol?: string;

  @ApiProperty({
    description: 'search through similar reward tokens symbol',
    required: false,
  })
  @IsOptional()
  @IsString()
  rewardTokenSymbol?: string;
}
