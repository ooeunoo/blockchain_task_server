import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { FarmModule } from '../../farm/farm.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { ApeSwapBSCService } from './ape-swap.bsc.service';
import { ApeSwapMATICService } from './ape-swap.matic.service';

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
  providers: [ApeSwapBSCService, ApeSwapMATICService],
  exports: [ApeSwapBSCService, ApeSwapMATICService],
})
export class ApeSwapModule {}
