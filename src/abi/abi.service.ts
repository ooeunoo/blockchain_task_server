import { Injectable } from '@nestjs/common';
import { EntityManager, FindOperator, TransactionManager } from 'typeorm';
import { Abi } from '@libs/repository/abi/entity';
import { AbiRepository } from '@libs/repository/abi/repository';

@Injectable()
export class AbiService {
  constructor(private readonly abiRepository: AbiRepository) {}

  async findAbi(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Abi> {
    return this.abiRepository._findOne(where, manager);
  }

  async findAbis(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Abi[]> {
    return this.abiRepository._findAll(where, manager);
  }
}
