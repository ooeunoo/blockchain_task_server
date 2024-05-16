import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { FarmModule } from '../../farm/farm.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { BakerySwapBSCService } from './bakery-swap.bsc.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    FarmModule,
  ],
  providers: [BakerySwapBSCService],
  exports: [BakerySwapBSCService],
})
export class BakerySwapModule {}
