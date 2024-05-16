import { BigNumberish } from '@ethersproject/bignumber';
import { EntityManager } from 'typeorm';
import { FarmService } from '../../farm/farm.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { Token } from '@libs/repository/token/entity';
import { TokenService } from '../../token/token.service';
import { SchedulerJobBase } from '../scheduler-job.base';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

export abstract class FarmTemplate extends SchedulerJobBase {
  constructor(
    public readonly id: string,
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly farmService: FarmService,
    public readonly context,
  ) {
    super(
      id,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
    );
  }

  getRewardToken(): Token {
    return this.context.token;
  }

  abstract networkPid(): Promise<BigNumberish>;

  abstract getFarmState(farmInfo?: any): Promise<any>;

  abstract registerFarm(
    farmInfo: any,
    manager?: EntityManager,
  ): Promise<boolean>;

  abstract refreshFarm(
    farmInfo: any,
    farmState: any,
    manager?: EntityManager,
  ): Promise<void>;

  abstract run(logger?: SchedulerLoggerDTO): Promise<void>;
}
