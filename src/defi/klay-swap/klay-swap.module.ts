import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { KlaySwapKLAYTNService } from './klay-swap.klaytn.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
  ],
  providers: [KlaySwapKLAYTNService],
  exports: [KlaySwapKLAYTNService],
})
export class KlaySwapModule {}
