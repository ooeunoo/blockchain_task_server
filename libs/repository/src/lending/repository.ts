import {
  DeepPartial,
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  TransactionManager,
  UpdateResult,
} from 'typeorm';
import { Lending } from './entity';

@EntityRepository(Lending)
export class LendingRepository extends Repository<Lending> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Lending> {
    const options: FindManyOptions<Lending> = {
      where,
      relations: [...Lending.relations, ...Lending.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Lending, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Lending[]> {
    const options: FindManyOptions<Lending> = {
      where,

      relations: [...Lending.relations, ...Lending.recursiveRelations],
    };

    if (manager) {
      return manager.find(Lending, options);
    }
    return this.find(options);
  }

  async _createOne(
    params: DeepPartial<Lending>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Lending>> {
    const entity = this.create(params);
    if (manager) {
      return manager.save(Lending, entity);
    }
    return this.save(entity);
  }

  async _createAll(
    params: DeepPartial<Lending[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Lending[]> {
    const entities = params.map((param) => this.create(param));

    if (manager) {
      return manager.save(Lending, entities);
    }
    return this.save(entities);
  }

  async _createAllIfNotExist(
    params: DeepPartial<Lending[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    let queryBuilder: SelectQueryBuilder<Lending>;

    if (manager) {
      queryBuilder = manager.createQueryBuilder();
    } else {
      queryBuilder = this.createQueryBuilder();
    }

    const entities = params.map((param) => this.create(param));

    return queryBuilder
      .insert()
      .into(Lending)
      .values(entities)
      .orIgnore()
      .execute();
  }

  async _updateOne(
    where: { [K in keyof Lending]?: Lending[K] | FindOperator<Lending[K]> },
    set: { [K in keyof Lending]?: Lending[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    if (manager) {
      return manager.update(Lending, where, set);
    }
    return this.update(where, set);
  }

  async _search(params: any): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('lending');

    this._searchQueryBuilder(queryBuilder, params);

    if (params.skipItems) {
      queryBuilder.offset(params.skipItems);
    }

    if (params.limit) {
      queryBuilder.limit(params.limit);
    }

    queryBuilder.select(Lending.select);

    const result = await queryBuilder.disableEscaping().getMany();
    return result;
  }

  async _searchDistinct(params: any, distinct: string): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('lending');

    this._searchQueryBuilder(queryBuilder, params);

    queryBuilder.distinct(true).select(distinct);

    const result = await queryBuilder.getRawMany();

    return result.map((r) => r[distinct.replace('.', '_')]);
  }

  _searchQueryBuilder(
    queryBuilder: SelectQueryBuilder<Lending>,
    params: any,
  ): SelectQueryBuilder<Lending> {
    Lending.relations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(`lending.${relation}`, relation);
    });

    Lending.recursiveRelations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(relation, relation.replace('.', '_'));
    });

    queryBuilder.andWhere('protocol.status = true');
    queryBuilder.andWhere('lending.status = true');

    if (params.id) {
      queryBuilder.andWhere('lending.id = :id', { id: params.id });
    }

    if (params.ids) {
      queryBuilder.andWhere('lending.id in (:ids)', { ids: params.ids });
    }

    if (params.protocolId) {
      queryBuilder.andWhere('protocol.id = :protocolId', {
        protocolId: params.protocolId,
      });
    }

    if (params.address) {
      queryBuilder.andWhere('lending.address = :address', {
        address: params.address,
      });
    }

    return queryBuilder;
  }
}
