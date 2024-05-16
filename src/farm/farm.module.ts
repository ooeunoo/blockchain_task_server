import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';

import { FarmRepository } from '@libs/repository/farm/repository';
@Module({
  imports: [TypeOrmModule.forFeature([FarmRepository])],
  providers: [FarmService],
  exports: [FarmService],
  controllers: [FarmController],
})
export class FarmModule {}
