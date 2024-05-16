import { Module } from '@nestjs/common';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { BakerySwapModule } from '../../defi/bakery-swap/bakery-swap.module';
import { FarmModule } from '../../farm/farm.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { BakerySwapBSCFarmService } from './bakery-swap-job.bsc.farm.service';
import { BakerySwapBSCPairService } from './bakery-swap-job.bsc.pair.service';

@Module({
  imports: [
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
    BakerySwapModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    BakerySwapBSCFarmService,
    BakerySwapBSCPairService,
  ],
  exports: [BakerySwapBSCFarmService, BakerySwapBSCPairService],
})
export class BakerySwapJobModule {}
