import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolService } from './protocol.service';
import { ProtocolRepository } from '@libs/repository/protocol/repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProtocolRepository])],
  providers: [ProtocolService],
  exports: [ProtocolService],
})
export class ProtocolModule {}
