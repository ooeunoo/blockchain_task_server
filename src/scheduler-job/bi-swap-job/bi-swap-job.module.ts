import { Module } from '@nestjs/common';
import { BiSwapJobBSCPairService } from './bi-swap-job.bsc.pair.service';
import { BiSwapJobBSCFarmService } from './bi-swap-job.bsc.farm.service';
import { BiSwapModule } from '../../defi/bi-swap/bi-swap.module';
import { TokenModule } from '../../token/token.module';
import { FarmModule } from '../../farm/farm.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';

@Module({
  imports: [
    BiSwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    BiSwapJobBSCFarmService,
    BiSwapJobBSCPairService,
  ],
  exports: [BiSwapJobBSCFarmService, BiSwapJobBSCPairService],
})
export class BiSwapJobModule {}
