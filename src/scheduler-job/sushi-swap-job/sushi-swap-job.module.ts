import { Module } from '@nestjs/common';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { FarmModule } from '../../farm/farm.module';
import { TokenModule } from '../../token/token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { SushiSwapModule } from '../../defi/sushi-swap/sushi-swap.module';
import { SushiSwapJobBSCPairService } from './sushi-swap-job.bsc.pair.service';
import { SushiSwapJobMATICPairService } from './sushi-swap-job.matic.pair.service';
import { SushiSwapJobMATICFarmService } from './sushi-swap-job.matic.farm.service';

@Module({
  imports: [
    SushiSwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    SushiSwapJobBSCPairService,
    SushiSwapJobMATICPairService,
    SushiSwapJobMATICFarmService,
    SushiSwapJobMATICPairService,
  ],
  exports: [
    SushiSwapJobBSCPairService,
    SushiSwapJobMATICPairService,
    SushiSwapJobMATICFarmService,
    SushiSwapJobMATICPairService,
  ],
})
export class SushiSwapJobModule {}
