import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbiService } from './abi.service';
import { AbiRepository } from '@libs/repository/abi/repository';

@Module({
  imports: [TypeOrmModule.forFeature([AbiRepository])],
  providers: [AbiService],
  exports: [AbiService],
})
export class AbiModule {}
