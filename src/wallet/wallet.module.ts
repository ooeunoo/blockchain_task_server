import { Module } from '@nestjs/common';
import { DefiModule } from '../defi/defi.module';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { NetworkModule } from '../network/network.module';
import { TokenModule } from '../token/token.module';
import { InteractionModule } from '../interaction/interaction.module';
import { ProtocolModule } from '../protocol/protocol.module';
import { FarmModule } from '../farm/farm.module';
import { NFTokenModule } from '../nf-token/nf-token.module';
import { LendingModule } from '../lending/lending.module';

@Module({
  imports: [
    DefiModule,
    NetworkModule,
    TokenModule,
    InteractionModule,
    ProtocolModule,
    FarmModule,
    NFTokenModule,
    LendingModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
