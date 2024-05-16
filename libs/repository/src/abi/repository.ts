import {
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  Repository,
  TransactionManager,
} from 'typeorm';
import { Abi } from './entity';

@EntityRepository(Abi)
export class AbiRepository extends Repository<Abi> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Abi> {
    const options: FindManyOptions<Abi> = {
      where,
      relations: [...Abi.relations, ...Abi.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Abi, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Abi[]> {
    const options: FindManyOptions<Abi> = {
      where,
      relations: [...Abi.relations, ...Abi.recursiveRelations],
    };

    if (manager) {
      return manager.find(Abi, options);
    }
    return this.find(options);
  }
}
