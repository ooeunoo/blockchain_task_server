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
import { NFToken } from './entity';

@EntityRepository(NFToken)
export class NFTokenRepository extends Repository<NFToken> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<NFToken> {
    const options: FindManyOptions<NFToken> = {
      where,
      relations: [...NFToken.relations, ...NFToken.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(NFToken, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<NFToken[]> {
    const options: FindManyOptions<NFToken> = {
      where,
      relations: [...NFToken.relations, ...NFToken.recursiveRelations],
    };

    if (manager) {
      return manager.find(NFToken, options);
    }
    return this.find(options);
  }

  async _createOne(
    params: DeepPartial<NFToken>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<NFToken>> {
    const entity = this.create(params);
    if (manager) {
      return manager.save(NFToken, entity);
    }
    return this.save(entity);
  }

  async _createAll(
    params: DeepPartial<NFToken[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<NFToken[]> {
    const entities = params.map((param) => this.create(param));

    if (manager) {
      return manager.save(NFToken, entities);
    }
    return this.save(entities);
  }

  async _createAllIfNotExist(
    params: DeepPartial<NFToken[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    let queryBuilder: SelectQueryBuilder<NFToken>;

    if (manager) {
      queryBuilder = manager.createQueryBuilder();
    } else {
      queryBuilder = this.createQueryBuilder();
    }

    const entities = params.map((param) => this.create(param));

    return queryBuilder
      .insert()
      .into(NFToken)
      .values(entities)
      .orIgnore()
      .execute();
  }

  async _updateOne(
    where: { [K in keyof NFToken]?: NFToken[K] | FindOperator<NFToken[K]> },
    set: { [K in keyof NFToken]?: NFToken[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    if (manager) {
      return manager.update(NFToken, where, set);
    }
    return this.update(where, set);
  }

  async _search(params: any): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('nf_token');

    this._searchQueryBuilder(queryBuilder, params);

    if (params.skipItems) {
      queryBuilder.offset(params.skipItems);
    }

    if (params.limit) {
      queryBuilder.limit(params.limit);
    }

    queryBuilder.select(NFToken.select);

    const result = await queryBuilder.disableEscaping().getMany();
    return result;
  }

  /**
   * 유니트 컬럼
   * @param params nftoken search query params
   * @param distinct column
   * @returns
   */
  async _searchDistinct(params: any, distinct: string): Promise<string[]> {
    const queryBuilder = this.createQueryBuilder('nf_token');

    this._searchQueryBuilder(queryBuilder, params);

    queryBuilder.distinct(true).select(distinct);
    const result = await queryBuilder.getRawMany();
    return result.map((r) => r[distinct.replace('.', '_')]);
  }

  private _searchQueryBuilder(
    queryBuilder: SelectQueryBuilder<NFToken>,
    params: any,
  ): SelectQueryBuilder<NFToken> {
    NFToken.relations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(`nf_token.${relation}`, relation);
    });

    NFToken.recursiveRelations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(relation, relation.replace('.', '_'));
    });

    queryBuilder.andWhere('protocol_network.status = true');
    queryBuilder.andWhere('protocol.status = true');
    queryBuilder.andWhere('nf_token.status = true');

    if (params.id) {
      queryBuilder.andWhere('nf_token.id = :id', { id: params.id });
    }

    if (params.protocolId) {
      queryBuilder.andWhere('protocol.id = :protocolId', {
        protocolId: params.protocolId,
      });
    }

    if (params.address) {
      queryBuilder.andWhere('nf_token.address = :address', {
        address: params.address,
      });
    }

    if (params.index) {
      queryBuilder.andWhere('nf_token.index = :index', { index: params.index });
    }

    if (params.indexes) {
      queryBuilder.andWhere('nf_token.index in (:indexes)', {
        indexes: params.indexes,
      });
    }

    return queryBuilder;
  }
}
