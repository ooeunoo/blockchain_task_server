import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  TransactionManager,
  UpdateResult,
  FindOperator,
  InsertResult,
} from 'typeorm';
import { Lending } from '@libs/repository/lending/entity';
import { LendingRepository } from '@libs/repository/lending/repository';
import { LendingSearchQuery } from './lending.dto';

@Injectable()
export class LendingService {
  constructor(private readonly lendingRepository: LendingRepository) {}

  async findLending(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Lending> {
    return this.lendingRepository._findOne(where, manager);
  }

  async findLendings(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Lending[]> {
    return this.lendingRepository._findAll(where, manager);
  }

  async createLending(
    params: DeepPartial<Lending>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Lending>> {
    return this.lendingRepository._createOne(params, manager);
  }

  async createLendings(
    params: DeepPartial<Lending[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Lending[]> {
    return this.lendingRepository._createAll(params, manager);
  }

  async createLendingsIfNotExist(
    params: DeepPartial<Lending[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    return this.lendingRepository._createAllIfNotExist(params, manager);
  }

  async updateLending(
    where: { [K in keyof Lending]?: Lending[K] | FindOperator<Lending[K]> },
    set: { [K in keyof Lending]?: Lending[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    return this.lendingRepository._updateOne(where, set, manager);
  }

  async search(params: LendingSearchQuery): Promise<Lending[]> {
    return this.lendingRepository._search(params);
  }

  async searchDistinct(
    params: LendingSearchQuery,
    distinct: string,
  ): Promise<Lending[]> {
    return this.lendingRepository._searchDistinct(params, distinct);
  }
}
