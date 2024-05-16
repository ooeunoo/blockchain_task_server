import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LendingService } from './lending.service';
import { LendingRepository } from '@libs/repository/lending/repository';
import { LendingController } from './lending.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LendingRepository])],
  providers: [LendingService],
  exports: [LendingService],
  controllers: [LendingController],
})
export class LendingModule {}
