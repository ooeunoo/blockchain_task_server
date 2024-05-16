import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { SchedulerRepository } from '@libs/repository/scheduler/repository';
@Module({
  imports: [TypeOrmModule.forFeature([SchedulerRepository])],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
