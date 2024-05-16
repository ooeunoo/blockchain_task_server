import { Module } from '@nestjs/common';
import { SchedulerLoggerService } from './scheduler-logger.service';

@Module({
  providers: [SchedulerLoggerService],
  exports: [SchedulerLoggerService],
})
export class SchedulerLoggerModule {}
