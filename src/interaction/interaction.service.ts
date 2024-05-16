import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  TransactionManager,
  FindOperator,
  InsertResult,
  DeleteResult,
} from 'typeorm';
import { Interaction } from '@libs/repository/interaction/entity';
import { InteractionRepository } from '@libs/repository/interaction/repository';
import { NetworkService } from '../network/network.service';
import { InteractionSearchQuery } from './interaction.dto';

@Injectable()
export class InteractionService {
  constructor(private readonly interactionRepository: InteractionRepository) {}

  async findInteraction(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Interaction> {
    return this.interactionRepository._findOne(where, manager);
  }

  async findInteractions(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Interaction[]> {
    return this.interactionRepository._findAll(where, manager);
  }

  async createInteraction(
    params: DeepPartial<Interaction>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<DeepPartial<Interaction>> {
    return this.interactionRepository._createOne(params, manager);
  }

  async createInteractions(
    params: DeepPartial<Interaction[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Interaction[]> {
    return this.interactionRepository._createAll(params, manager);
  }

  async createInteractionsIfNotExist(
    params: DeepPartial<Interaction[]>,
    @TransactionManager() manager?: EntityManager,
  ): Promise<InsertResult> {
    return this.interactionRepository._createAllIfNotExist(params, manager);
  }

  async findInteractionAddresses(searchParams?: {
    [K in keyof Interaction]?: Interaction[K] | FindOperator<Interaction[K]>;
  }): Promise<string[]> {
    const interactions = await this.findInteractions(searchParams);
    return interactions.map(({ to_address }) => to_address);
  }

  async deleteInteraction(where?: {
    [K in keyof Interaction]?: Interaction[K] | FindOperator<Interaction[K]>;
  }): Promise<DeleteResult> {
    return this.interactionRepository._deleteOne(where);
  }
}
