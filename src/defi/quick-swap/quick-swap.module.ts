import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/token.module';
import { AbiModule } from '../../abi/abi.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { FarmModule } from '../../farm/farm.module';
import { QuickSwapMATICService } from './quick-swap.bsc.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    FarmModule,
  ],
  providers: [QuickSwapMATICService],
  exports: [QuickSwapMATICService],
})
export class QuickSwapModule {}
