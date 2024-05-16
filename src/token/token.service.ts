import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  TransactionManager,
  UpdateResult,
  FindOperator,
  InsertResult,
} from 'typeorm';
import { Token } from '@libs/repository/token/entity';
import { TokenRepository } from '@libs/repository/token/repository';
import { TokenSearchQuery } from './token.dto';

@Injectable()
export class TokenService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async findToken(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Token> {
    return this.tokenRepository._findOne(where, manager);
  }

  async findTokens(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Token[]> {
    return this.tokenRepository._findAll(where, manager);
  }

  async createToken(
    params: DeepPartial<Token>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Token>> {
    return this.tokenRepository._createOne(params, manager);
  }

  async createTokens(
    params: DeepPartial<Token[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Token[]> {
    return this.tokenRepository._createAll(params, manager);
  }

  async createTokensIfNotExist(
    params: DeepPartial<Token[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    return this.tokenRepository._createAllIfNotExist(params, manager);
  }

  async updateToken(
    where: { [K in keyof Token]?: Token[K] | FindOperator<Token[K]> },
    set: { [K in keyof Token]?: Token[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    return this.tokenRepository._updateOne(where, set, manager);
  }

  async search(params: TokenSearchQuery): Promise<Token[]> {
    return this.tokenRepository._search(params);
  }

  async searchDistinct(
    params: TokenSearchQuery,
    distinct: string,
  ): Promise<string[]> {
    return this.tokenRepository._searchDistinct(params, distinct);
  }
}
