import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumberString, IsOptional } from 'class-validator';
import { PaginationRequest } from '../app/pagination/pagination.request';

export class ProtocolSearchQuery extends PaginationRequest {
  @ApiProperty({
    description: 'search through protocol id',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  id?: number;

  @ApiProperty({
    description: 'search through multiple protocol id',
  })
  @IsOptional()
  ids?: number[];

  @ApiProperty({
    description: 'search through useAMM, is protocol has amm service',
  })
  @IsBoolean()
  useAMM?: boolean;

  @ApiProperty({
    description: 'search through useFarm, is protocol has farm service',
  })
  @IsBoolean()
  useFarm?: boolean;

  @ApiProperty({
    description: 'search through useLending, is protocol has lending service',
  })
  @IsBoolean()
  useLending?: boolean;

  @ApiProperty({
    description: 'search through useNFT, is protocol has nft service',
  })
  @IsBoolean()
  useNFT?: boolean;
}
