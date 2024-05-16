import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { SushiSwapBSCService } from './sushi-swap.bsc.service';
import { SushiSwapHECOService } from './sushi-swap.heco.service';
import { SushiSwapMATICService } from './sushi-swap.matic.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
  ],
  providers: [SushiSwapBSCService, SushiSwapMATICService, SushiSwapHECOService],
  exports: [SushiSwapBSCService, SushiSwapMATICService, SushiSwapHECOService],
})
export class SushiSwapModule {}
