import {
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOperator,
  Repository,
  SelectQueryBuilder,
  TransactionManager,
} from 'typeorm';
import { Network } from './entity';

@EntityRepository(Network)
export class NetworkRepository extends Repository<Network> {
  async _findOne(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Network> {
    const options: FindManyOptions<Network> = {
      where,
      relations: [...Network.relations, ...Network.recursiveRelations],
    };

    if (manager) {
      return manager.findOne(Network, options);
    }
    return this.findOne(options);
  }

  async _findAll(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Network[]> {
    const options: FindManyOptions<Network> = {
      where,
      relations: [...Network.relations, ...Network.recursiveRelations],
    };

    if (manager) {
      return manager.find(Network, options);
    }
    return this.find(options);
  }

  async _search(params: any): Promise<any[]> {
    const queryBuilder = this.createQueryBuilder('network');

    this._searchQueryBuilder(queryBuilder, params);

    if (params.skipItems) {
      queryBuilder.offset(params.skipItems);
    }

    if (params.limit) {
      queryBuilder.limit(params.limit);
    }

    queryBuilder.select(Network.select);

    const result = await queryBuilder.disableEscaping().getMany();
    return result;
  }

  private _searchQueryBuilder(
    queryBuilder: SelectQueryBuilder<Network>,
    params: any,
  ): SelectQueryBuilder<Network> {
    Network.relations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(`network.${relation}`, relation);
    });

    Network.recursiveRelations.forEach((relation: string) => {
      queryBuilder.leftJoinAndSelect(relation, relation.replace('.', '_'));
    });

    queryBuilder.andWhere('network.status = true');

    if (params.id) {
      queryBuilder.andWhere('network.id = :id', { id: params.id });
    }

    return queryBuilder;
  }
}
