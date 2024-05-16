import { Module } from '@nestjs/common';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { FarmModule } from '../../farm/farm.module';
import { TokenModule } from '../../token/token.module';
import { MdexModule } from '../../defi/mdex/mdex.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { MdexJobBSCPairService } from './mdex-job.bsc.pair.service';
import { MdexJobBSCFarmService } from './mdex-job.bsc.farm.service';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { MdexJobHECOFarmService } from './mdex-job.heco.farm.service';
import { MdexJobHECOPairService } from './mdex-job.heco.pair.service';

@Module({
  imports: [
    MdexModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    MdexJobBSCFarmService,
    MdexJobBSCPairService,
    MdexJobHECOFarmService,
    MdexJobHECOPairService,
  ],
  exports: [
    MdexJobBSCFarmService,
    MdexJobBSCPairService,
    MdexJobHECOFarmService,
    MdexJobHECOPairService,
  ],
})
export class MdexJobModule {}
