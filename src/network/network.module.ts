import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkService } from './network.service';
import { NetworkRepository } from '@libs/repository/network/repository';
import { NetworkController } from './network.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkRepository])],
  providers: [NetworkService],
  exports: [NetworkService],
  controllers: [NetworkController],
})
export class NetworkModule {}
