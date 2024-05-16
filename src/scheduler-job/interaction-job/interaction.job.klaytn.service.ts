import { Injectable } from '@nestjs/common';
import { ID } from '../scheduler-job.constant';
import { InteractionTemplate } from '../template/interaction.template';
import { NetworkService } from '../../network/network.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { InteractionService } from '../../interaction/interaction.service';
import { CHAIN_ID } from '@libs/helper/blockchain';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';

@Injectable()
export class InteractionKLAYTNService extends InteractionTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly networkService: NetworkService,
    public readonly interactionService: InteractionService,
  ) {
    super(
      ID.INTERACTION.KLAYTN,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      networkService,
      interactionService,
      CHAIN_ID.KLAYTN,
    );
  }
}
