import { Injectable } from '@nestjs/common';
import { EntityManager, FindOperator, TransactionManager } from 'typeorm';
import { Protocol } from '@libs/repository/protocol/entity';
import { ProtocolRepository } from '@libs/repository/protocol/repository';
import { ProtocolSearchQuery } from './protocol.dto';
@Injectable()
export class ProtocolService {
  constructor(private readonly protocolRepository: ProtocolRepository) {}

  async findProtocol(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Protocol> {
    return this.protocolRepository._findOne(where, manager);
  }

  async findProtocols(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Protocol[]> {
    return this.protocolRepository._findAll(where, manager);
  }

  /**
   * 조회
   * @param params protocolSearchQuery
   * @returns Farm entities & total number
   */
  async search(params: ProtocolSearchQuery): Promise<Protocol[]> {
    return this.protocolRepository._search(params);
  }

  /**
   * 유니크 컬럼
   * @param params farm search query params
   * @param distinct column
   * @returns
   */
  async searchDistinct(
    params: ProtocolSearchQuery,
    distinct: string,
  ): Promise<string[]> {
    return this.protocolRepository._searchDistinct(params, distinct);
  }
}
