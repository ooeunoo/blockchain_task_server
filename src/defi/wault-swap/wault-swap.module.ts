import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { FarmModule } from '../../farm/farm.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { WaultSwapBSCService } from './wault-swap.bsc.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    FarmModule,
  ],
  providers: [WaultSwapBSCService],
  exports: [WaultSwapBSCService],
})
export class WaultSwapModule {}
