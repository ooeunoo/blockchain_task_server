import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  TransactionManager,
} from 'typeorm';
import { Interaction } from './entity';

@EntityRepository(Interaction)
export class InteractionRepository extends Repository<Interaction> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Interaction> {
    const options: FindManyOptions<Interaction> = {
      where,
      relations: [...Interaction.relations, ...Interaction.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Interaction, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Interaction[]> {
    const options: FindManyOptions<Interaction> = {
      where,
      relations: [...Interaction.relations, ...Interaction.recursiveRelations],
    };

    if (manager) {
      return manager.find(Interaction, options);
    }
    return this.find(options);
  }

  async _createOne(
    params: DeepPartial<Interaction>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Interaction>> {
    const entity = this.create(params);
    if (manager) {
      return manager.save(Interaction, entity);
    }
    return this.save(entity);
  }

  async _createAll(
    params: DeepPartial<Interaction[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Interaction[]> {
    const entities = params.map((param) => this.create(param));

    if (manager) {
      return manager.save(Interaction, entities);
    }
    return this.save(entities);
  }

  async _createAllIfNotExist(
    params: DeepPartial<Interaction[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    let queryBuilder: SelectQueryBuilder<Interaction>;

    if (manager) {
      queryBuilder = manager.createQueryBuilder();
    } else {
      queryBuilder = this.createQueryBuilder();
    }

    const entities = params.map((param) => this.create(param));

    return queryBuilder
      .insert()
      .into(Interaction)
      .values(entities)
      .orIgnore()
      .execute();
  }

  async _deleteOne(where?: {
    [K in keyof any]?: any[K] | FindOperator<any[K]>;
  }): Promise<DeleteResult> {
    return this.delete(where);
  }
}
