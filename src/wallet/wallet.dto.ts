import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { Farm } from '@libs/repository/farm/entity';
import { Lending } from '@libs/repository/lending/entity';
import { NFToken } from '@libs/repository/nf-token/entity';
import { Token } from '@libs/repository/token/entity';
import { IsValidWalletAddress } from './wallet.validation';

export class WalletParams {
  @Validate(IsValidWalletAddress)
  walletAddress: string;
}

export class TokenBalanceItem extends Token {
  wallet: {
    balance: string;
  };
}

export class FarmInfoItem extends Farm {
  wallet: {
    stake_amount: string[];
    reward_amount: string[];
  };
}

export class NFTokenInfoItem extends NFToken {}

export class LendingInfoItem extends Lending {
  wallet: {
    supply_amount: string;
    borrow_amount: string;
  };
}

export class WalletTokenBalanceItem {
  @ApiProperty({
    description: 'Number of items',
  })
  itemCount: number;

  @ApiProperty({
    description: 'items',
  })
  items: TokenBalanceItem[];
}

export class WalletFarmInfosItem {
  @ApiProperty({
    description: 'Number of items',
  })
  itemCount: number;

  @ApiProperty({
    description: 'items',
  })
  items: FarmInfoItem[];
}

export class WalletNFTokenInfosItem {
  @ApiProperty({
    description: 'Number of items',
  })
  itemCount: number;

  @ApiProperty({
    description: 'items',
  })
  items: NFTokenInfoItem[];
}

export class WalletLendingInfosItem {
  @ApiProperty({
    description: 'Number of items',
  })
  itemCount: number;

  @ApiProperty({
    description: 'items',
  })
  items: LendingInfoItem[];
}
