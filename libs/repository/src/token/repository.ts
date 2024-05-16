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
import { Token } from './entity';

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Token> {
    const options: FindManyOptions<Token> = {
      where,
      relations: [...Token.relations, ...Token.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Token, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Token[]> {
    const options: FindManyOptions<Token> = {
      where,
      relations: [...Token.relations, ...Token.recursiveRelations],
    };

    if (manager) {
      return manager.find(Token, options);
    }
    return this.find(options);
  }

  async _createOne(
    params: DeepPartial<Token>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Token>> {
    const entity = this.create(params);
    if (manager) {
      return manager.save(Token, entity);
    }
    return this.save(entity);
  }

  async _createAll(
    params: DeepPartial<Token[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Token[]> {
    const entities = params.map((param) => this.create(param));

    if (manager) {
      return manager.save(Token, entities);
    }
    return this.save(entities);
  }

  async _createAllIfNotExist(
    params: DeepPartial<Token[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    let queryBuilder: SelectQueryBuilder<Token>;

    if (manager) {
      queryBuilder = manager.createQueryBuilder();
    } else {
      queryBuilder = this.createQueryBuilder();
    }

    const entities = params.map((param) => this.create(param));

    return queryBuilder
      .insert()
      .into(Token)
      .values(entities)
      .orIgnore()
      .execute();
  }

  async _updateOne(
    where: { [K in keyof Token]?: Token[K] | FindOperator<Token[K]> },
    set: { [K in keyof Token]?: Token[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    if (manager) {
      return manager.update(Token, where, set);
    }
    return this.update(where, set);
  }

  async _search(params: any): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('token');

    this._searchQueryBuilder(queryBuilder, params);

    if (params.skipItems) {
      queryBuilder.offset(params.skipItems);
    }

    if (params.limit) {
      queryBuilder.limit(params.limit);
    }

    queryBuilder.select(Token.select);

    const result = await queryBuilder.disableEscaping().getMany();
    return result;
  }

  async _searchDistinct(params: any, distinct: string): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('token');

    this._searchQueryBuilder(queryBuilder, params);

    queryBuilder.distinct(true).select(distinct);

    const result = await queryBuilder.getRawMany();

    return result.map((r) => r[distinct.replace('.', '_')]);
  }

  private _searchQueryBuilder(
    queryBuilder: SelectQueryBuilder<Token>,
    params: any,
  ): SelectQueryBuilder<Token> {
    Token.relations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(`token.${relation}`, relation);
    });

    Token.recursiveRelations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(relation, relation.replace('.', '_'));
    });

    queryBuilder.andWhere('network.status = true');
    queryBuilder.andWhere('token.status = true');

    if (params.id) {
      queryBuilder.andWhere('token.id = :id', { id: params.id });
    }

    if (params.address) {
      queryBuilder.andWhere('token.address = :address', {
        address: params.address,
      });
    }

    if (params.addresses) {
      queryBuilder.andWhere('token.address in (:addresses)', {
        addresses: params.addresses,
      });
    }

    if (params.symbol) {
      queryBuilder.andWhere('token.symbol = :symbol', {
        symbol: params.symbol,
      });
    }

    if (params.chainId) {
      queryBuilder.andWhere('network.chain_id = :chainId', {
        chainId: params.chainId,
      });
    }

    return queryBuilder;
  }
}
