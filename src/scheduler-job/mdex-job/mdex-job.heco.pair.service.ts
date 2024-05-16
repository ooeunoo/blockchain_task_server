import { Injectable } from '@nestjs/common';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { MdexHECOService } from '../../defi/mdex/mdex.heco.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { PairTemplate } from '../template/pair.template';

@Injectable()
export class MdexJobHECOPairService extends PairTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly context: MdexHECOService,
  ) {
    super(
      ID.MDEX.HECO.PAIR,
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
