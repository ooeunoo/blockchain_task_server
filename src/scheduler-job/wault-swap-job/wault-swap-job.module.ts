import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { FarmModule } from '../../farm/farm.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';
import { WaultSwapBSCPairService } from './wault-swap-job.bsc.pair.service';
import { WaultSwapBSCFarmService } from './wault-swap-job.bsc.farm.service';
import { WaultSwapModule } from '../../defi/wault-swap/wault-swap.module';

@Module({
  imports: [
    WaultSwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
    NFTokenModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    WaultSwapBSCPairService,
    WaultSwapBSCFarmService,
  ],
  exports: [WaultSwapBSCPairService, WaultSwapBSCFarmService],
})
export class WaultSwapJobModule {}
