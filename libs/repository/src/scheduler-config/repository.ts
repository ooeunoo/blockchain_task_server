import {
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  Repository,
  UpdateResult,
} from 'typeorm';
import { SchedulerConfig } from './entity';

@EntityRepository(SchedulerConfig)
export class SchedulerConfigRepository extends Repository<SchedulerConfig> {
  async _findOne(where?: {
    [K in keyof any]?: any[K] | FindOperator<any[K]>;
  }): Promise<SchedulerConfig> {
    const options: FindManyOptions<SchedulerConfig> = {
      where,
    };

    return this.findOne(options);
  }

  async _updateOne(
    where: {
      [K in keyof SchedulerConfig]?:
        | SchedulerConfig[K]
        | FindOperator<SchedulerConfig[K]>;
    },
    set: { [K in keyof SchedulerConfig]?: SchedulerConfig[K] },
  ): Promise<UpdateResult> {
    return this.update(where, set);
  }
}
