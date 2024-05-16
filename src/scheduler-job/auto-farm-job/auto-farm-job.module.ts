import { Module } from '@nestjs/common';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { AutoFarmModule } from '../../defi/auto-farm/auto-farm.module';
import { FarmModule } from '../../farm/farm.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { AutoFarmBSCFarmService } from './auto-farm-job.bsc.farm.service';

@Module({
  imports: [
    AutoFarmModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
  ],
  providers: [SingletonSchedulerRegistry, AutoFarmBSCFarmService],
  exports: [AutoFarmBSCFarmService],
})
export class AutoFarmJobModule {}
