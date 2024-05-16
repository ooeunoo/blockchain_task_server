import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  TransactionManager,
  UpdateResult,
  FindOperator,
  InsertResult,
} from 'typeorm';
import { NFToken } from '@libs/repository/nf-token/entity';
import { NFTokenRepository } from '@libs/repository/nf-token/repository';
import { NFTokenSearchQuery } from './nf-token.dto';
@Injectable()
export class NFTokenService {
  constructor(private readonly nfTokenRepository: NFTokenRepository) {}

  async findNFToken(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<NFToken> {
    return this.nfTokenRepository._findOne(where, manager);
  }

  async findNFTokens(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<NFToken[]> {
    return this.nfTokenRepository._findAll(where, manager);
  }

  async createNFToken(
    params: DeepPartial<NFToken>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<NFToken>> {
    return this.nfTokenRepository._createOne(params, manager);
  }

  async createNFTokens(
    params: DeepPartial<NFToken[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<NFToken[]> {
    return this.nfTokenRepository._createAll(params, manager);
  }

  async createNFTokensIfNotExist(
    params: DeepPartial<NFToken[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    return this.nfTokenRepository._createAllIfNotExist(params, manager);
  }

  async updateNFToken(
    where: { [K in keyof NFToken]?: NFToken[K] | FindOperator<NFToken[K]> },
    set: { [K in keyof NFToken]?: NFToken[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    return this.nfTokenRepository._updateOne(where, set, manager);
  }

  async search(params: NFTokenSearchQuery): Promise<NFToken[]> {
    return this.nfTokenRepository._search(params);
  }

  /**
   * 유니트 컬럼
   * @param params nftoken search query params
   * @param distinct column
   * @returns
   */
  async searchDistinct(
    params: NFTokenSearchQuery,
    distinct: string,
  ): Promise<string[]> {
    return this.nfTokenRepository._searchDistinct(params, distinct);
  }
}
