import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { VenusBSCService } from './venus.bsc.service';
import { LendingModule } from '../../lending/lending.module';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    LendingModule,
  ],
  providers: [VenusBSCService],
  exports: [VenusBSCService],
})
export class VenusModule {}
