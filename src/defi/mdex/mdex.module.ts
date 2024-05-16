import { Module } from '@nestjs/common';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { AbiModule } from '../../abi/abi.module';
import { TokenModule } from '../../token/token.module';
import { InteractionModule } from '../../interaction/interaction.module';
import { FarmModule } from '../../farm/farm.module';
import { MdexBSCService } from './mdex.bsc.service';

import { MdexHECOService } from './mdex.heco.service';

@Module({
  imports: [
    NetworkModule,
    ProtocolModule,
    AbiModule,
    TokenModule,
    InteractionModule,
    FarmModule,
  ],
  providers: [MdexBSCService, MdexHECOService],
  exports: [MdexBSCService, MdexHECOService],
})
export class MdexModule {}
