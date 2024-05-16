import { Module } from '@nestjs/common';
import { VenusJobBSCLendingService } from './venus-job.bsc.lending.service';
import { VenusModule } from '../../defi/venus/venus.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { LendingModule } from '../../lending/lending.module';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';

@Module({
  imports: [
    VenusModule,
    SchedulerModule,
    TokenModule,
    LendingModule,
    SchedulerLoggerModule,
  ],
  providers: [SingletonSchedulerRegistry, VenusJobBSCLendingService],
  exports: [VenusJobBSCLendingService],
})
export class VenusJobModule {}
