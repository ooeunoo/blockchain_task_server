import { Module } from '@nestjs/common';
import { SwapService } from './swap.service';
import { TokenModule } from '../token/token.module';
import { NetworkModule } from '../network/network.module';
import { ProtocolModule } from '../protocol/protocol.module';
import { DefiModule } from '../defi/defi.module';
import { SwapController } from './swap.controller';

@Module({
  imports: [TokenModule, NetworkModule, ProtocolModule, DefiModule],
  providers: [SwapService],
  exports: [SwapService],
  controllers: [SwapController],
})
export class SwapModule {}
