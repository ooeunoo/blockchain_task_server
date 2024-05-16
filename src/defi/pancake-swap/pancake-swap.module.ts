import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/token.module';
import { AbiModule } from '../../abi/abi.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { PancakeSwapBSCService } from './pancake-swap.bsc.service';
import { InteractionModule } from '../../interaction/interaction.module';
import { FarmModule } from '../../farm/farm.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    FarmModule,
    NFTokenModule,
  ],
  providers: [PancakeSwapBSCService],
  exports: [PancakeSwapBSCService],
})
export class PancakeSwapModule {}
