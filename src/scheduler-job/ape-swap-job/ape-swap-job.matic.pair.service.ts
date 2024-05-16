import { Injectable } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { PairTemplate } from '../template/pair.template';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { ApeSwapMATICService } from '../../defi/ape-swap/ape-swap.matic.service';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';

@Injectable()
export class ApeSwapMATICPairService extends PairTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly context: ApeSwapMATICService,
  ) {
    super(
      ID.APE_SWAP.MATIC.PAIR,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      tokenService,
      context,
    );
  }

  onModuleInit(): Promise<void> {
    return;
  }
}
