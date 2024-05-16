import {
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  Repository,
  TransactionManager,
  UpdateResult,
} from 'typeorm';
import { Scheduler } from './entity';

@EntityRepository(Scheduler)
export class SchedulerRepository extends Repository<Scheduler> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Scheduler> {
    const options: FindManyOptions<Scheduler> = {
      where,
      relations: [...Scheduler.relations, ...Scheduler.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Scheduler, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Scheduler[]> {
    const options: FindManyOptions<Scheduler> = {
      where,
      relations: [...Scheduler.relations, ...Scheduler.recursiveRelations],
    };

    if (manager) {
      return manager.find(Scheduler, options);
    }
    return this.find(options);
  }

  async _updateOne(
    where: {
      [K in keyof Scheduler]?: Scheduler[K] | FindOperator<Scheduler[K]>;
    },
    set: { [K in keyof Scheduler]?: Scheduler[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    if (manager) {
      return manager.update(Scheduler, where, set);
    }
    return this.update(where, set);
  }
}
