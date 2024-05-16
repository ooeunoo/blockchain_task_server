import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { AirNftBSCService } from './air-nft.bsc.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    NFTokenModule,
  ],
  providers: [AirNftBSCService],
  exports: [AirNftBSCService],
})
export class AirNftModule {}
