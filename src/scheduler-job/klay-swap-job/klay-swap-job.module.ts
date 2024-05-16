import { Module } from '@nestjs/common';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { FarmModule } from '../../farm/farm.module';
import { TokenModule } from '../../token/token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { KlaySwapKLAYTNPairService } from './klay-swap-job.klaytn.pair.service';
import { KlaySwapModule } from '../../defi/klay-swap/klay-swap.module';

@Module({
  imports: [
    KlaySwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
  ],
  providers: [SingletonSchedulerRegistry, KlaySwapKLAYTNPairService],
  exports: [KlaySwapKLAYTNPairService],
})
export class KlaySwapJobModule {}
