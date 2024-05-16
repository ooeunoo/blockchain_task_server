import {
  DeepPartial,
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  Repository,
  SelectQueryBuilder,
  TransactionManager,
  UpdateResult,
} from 'typeorm';
import { Farm } from './entity';

@EntityRepository(Farm)
export class FarmRepository extends Repository<Farm> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Farm> {
    const options: FindManyOptions<Farm> = {
      where,
      relations: [...Farm.relations, ...Farm.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Farm, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Farm[]> {
    const options: FindManyOptions<Farm> = {
      where,
      relations: [...Farm.relations, ...Farm.recursiveRelations],
    };

    if (manager) {
      return manager.find(Farm, options);
    }
    return this.find(options);
  }

  async _createOne(
    params: DeepPartial<Farm>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Farm>> {
    const entity = this.create(params);
    if (manager) {
      return manager.save(Farm, entity);
    }
    return this.save(entity);
  }

  async _createAll(
    params: DeepPartial<Farm[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Farm[]> {
    const entities = params.map((param) => this.create(param));

    if (manager) {
      return manager.save(Farm, entities);
    }
    return this.save(entities);
  }

  async _updateOne(
    where: { [K in keyof Farm]?: Farm[K] | FindOperator<Farm[K]> },
    set: { [K in keyof Farm]?: Farm[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    if (manager) {
      return manager.update(Farm, where, set);
    }
    return this.update(where, set);
  }

  async _search(params: any): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('farm');

    this._searchQueryBuilder(queryBuilder, params);

    if (params.skipItems) {
      queryBuilder.offset(params.skipItems);
    }

    if (params.limit) {
      queryBuilder.limit(params.limit);
    }

    queryBuilder.select(Farm.select);

    const result = await queryBuilder.disableEscaping().getMany();
    return result;
  }

  async _searchDistinct(params: any, distinct: string): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('farm');

    this._searchQueryBuilder(queryBuilder, params);

    queryBuilder.distinct(true).select(distinct);

    const result = await queryBuilder.getRawMany();

    return result.map((r) => r[distinct.replace('.', '_')]);
  }

  _searchQueryBuilder(
    queryBuilder: SelectQueryBuilder<Farm>,
    params: any,
  ): SelectQueryBuilder<Farm> {
    // relations
    Farm.relations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(`farm.${relation}`, relation);
    });

    // recursive relations
    Farm.recursiveRelations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(relation, relation.replace('.', '_'));
    });

    queryBuilder.andWhere('farm.status = true');
    queryBuilder.andWhere('protocol.status = true');
    queryBuilder.andWhere('protocol_network.status = true');
    queryBuilder.andWhere('stake_tokens.status = true');
    queryBuilder.andWhere('reward_tokens.status = true');

    if (params.id) {
      queryBuilder.andWhere('farm.id = :id', { id: params.id });
    }

    if (params.protocolId) {
      queryBuilder.andWhere('protocol.id = :protocolId', {
        protocolId: params.protocolId,
      });
    }

    if (params.address) {
      queryBuilder.andWhere('farm.address = :address', {
        address: params.address,
      });
    }

    if (params.addresses) {
      queryBuilder.andWhere('farm.address in (:addresses)', {
        addresses: params.addresses,
      });
    }

    if (params.stakeTokenType) {
      queryBuilder.andWhere('stake_tokens.type = :stakeTokenType', {
        stakeTokenType: params.stakeTokenType,
      });
    }

    if (params.rewardTokenType) {
      queryBuilder.andWhere('reward_tokens.type = :rewardTokenType', {
        rewardTokenType: params.rewardTokenType,
      });
    }

    if (params.stakeTokenSymbol) {
      queryBuilder.andWhere('stake_tokens.symbol like :stakeTokenSymbol', {
        stakeTokenSymbol: `%${params.stakeTokenSymbol}%`,
      });
    }

    if (params.rewardTokenSymbol) {
      queryBuilder.andWhere('reward_tokens.symbol like :rewardTokenSymbol', {
        rewardTokenSymbol: `%${params.rewardTokenSymbol}%`,
      });
    }

    return queryBuilder;
  }
}
