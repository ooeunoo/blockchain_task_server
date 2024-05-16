import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  FindManyOptions,
  FindOperator,
  TransactionManager,
  UpdateResult,
} from 'typeorm';
import { Scheduler } from '@libs/repository/scheduler/entity';
import { SchedulerRepository } from '@libs/repository/scheduler/repository';
@Injectable()
export class SchedulerService {
  constructor(private readonly schedulerRepository: SchedulerRepository) {}

  async findScheduler(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Scheduler> {
    return this.schedulerRepository._findOne(where, manager);
  }

  async findSchedulers(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Scheduler[]> {
    return this.schedulerRepository._findAll(where, manager);
  }

  async updateScheduler(
    where: {
      [K in keyof Scheduler]?: Scheduler[K] | FindOperator<Scheduler[K]>;
    },
    set: { [K in keyof Scheduler]?: Scheduler[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    return this.schedulerRepository._updateOne(where, set, manager);
  }
}
