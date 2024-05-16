import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { FarmModule } from '../../farm/farm.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { QuickSwapModule } from '../../defi/quick-swap/quick-swap.module';
import { QuickSwapMATICPairService } from './quick-swap-job.bsc.pair.service';

@Module({
  imports: [
    QuickSwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
  ],
  providers: [SingletonSchedulerRegistry, QuickSwapMATICPairService],
  exports: [QuickSwapMATICPairService],
})
export class QuickSwapJobModule {}
