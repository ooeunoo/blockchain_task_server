import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Validate } from 'class-validator';
import { IsValidWalletAddress } from '../wallet/wallet.validation';

export class InteractionBody {
  @ApiProperty({
    description: 'interaction chain id',
    required: true,
  })
  @IsNumberString()
  chainId: string;

  @ApiProperty({
    description: 'interaction based address',
    required: true,
  })
  @Validate(IsValidWalletAddress)
  address: string;

  @ApiProperty({
    description: 'interaction target address',
    required: true,
  })
  @Validate(IsValidWalletAddress)
  interactedAddress: string;
}

export class InteractionSearchQuery {
  @ApiProperty({
    description: 'interaction based address',
    required: false,
  })
  @Validate(IsValidWalletAddress)
  address?: string;

  @ApiProperty({
    description: 'interaction target address',
    required: false,
  })
  @Validate(IsValidWalletAddress)
  interactedAddress?: string;

  @ApiProperty({
    description: 'interaction target addresses',
    required: false,
  })
  @Validate(IsValidWalletAddress)
  interactedAddresses?: string[];
}
