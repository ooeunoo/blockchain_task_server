import { Injectable } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { PairTemplate } from '../template/pair.template';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { BakerySwapBSCService } from '../../defi/bakery-swap/bakery-swap.bsc.service';

@Injectable()
export class BakerySwapBSCPairService extends PairTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly context: BakerySwapBSCService,
  ) {
    super(
      ID.BAKERY_SWAP.BSC.PAIR,
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
