import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  FindOperator,
  TransactionManager,
  UpdateResult,
} from 'typeorm';
import { Farm } from '@libs/repository/farm/entity';
import { FarmRepository } from '@libs/repository/farm/repository';
import { FarmSearchQuery } from './farm.dto';

@Injectable()
export class FarmService {
  constructor(private readonly farmRepository: FarmRepository) {}

  async findFarm(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Farm> {
    return this.farmRepository._findOne(where, manager);
  }

  async findFarms(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Farm[]> {
    return this.farmRepository._findAll(where, manager);
  }

  async createFarm(
    params: DeepPartial<Farm>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Farm>> {
    return this.farmRepository._createOne(params, manager);
  }

  async createFarms(
    params: DeepPartial<Farm[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Farm[]> {
    return this.farmRepository._createAll(params, manager);
  }

  async updateFarm(
    where: { [K in keyof Farm]?: Farm[K] | FindOperator<Farm[K]> },
    set: { [K in keyof Farm]?: Farm[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    return this.farmRepository._updateOne(where, set, manager);
  }

  async search(params: FarmSearchQuery): Promise<Farm[]> {
    return this.farmRepository._search(params);
  }

  async searchDistinct(
    params: FarmSearchQuery,
    distinct: string,
  ): Promise<string[]> {
    return this.farmRepository._searchDistinct(params, distinct);
  }
}
