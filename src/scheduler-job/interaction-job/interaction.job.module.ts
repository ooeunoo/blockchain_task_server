import { Module } from '@nestjs/common';
import { InteractionModule } from '../../interaction/interaction.module';
import { InteractionBSCService } from './interaction.job.bsc.service';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { NetworkModule } from '../../network/network.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { InteractionHECOService } from './interaction.job.heco.service';
import { InteractionMATICService } from './interaction.job.matic.service';
import { InteractionKLAYTNService } from './interaction.job.klaytn.service';

@Module({
  imports: [
    InteractionModule,
    SchedulerModule,
    TokenModule,
    NetworkModule,
    SchedulerLoggerModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    InteractionBSCService,
    InteractionHECOService,
    InteractionMATICService,
    InteractionKLAYTNService,
  ],
  exports: [
    InteractionBSCService,
    InteractionHECOService,
    InteractionMATICService,
    InteractionKLAYTNService,
  ],
})
export class InteractionJobModule {}
