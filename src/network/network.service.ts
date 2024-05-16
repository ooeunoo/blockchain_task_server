import { Injectable } from '@nestjs/common';
import { Provider } from '@ethersproject/providers';
import {
  EntityManager,
  FindOperator,
  TransactionManager,
  UpdateResult,
} from 'typeorm';
import { ethers } from 'ethers';
import { config } from '../common/config/config.service';
import { ExtendNetworkProvider } from './network.interface';
import { randomPick } from '@libs/helper/array';
import { NetworkRepository } from '@libs/repository/network/repository';
import { Network } from '@libs/repository/network/entity';
import { NetworkSearchQuery } from './network.dto';

@Injectable()
export class NetworkService {
  public networkWithProviderByChainId = new Map<
    number,
    ExtendNetworkProvider
  >();

  constructor(private readonly networkRepository: NetworkRepository) {}

  async onModuleInit(): Promise<void> {
    const networks = await this.findNetworks({});

    networks.forEach((network: Network) => {
      const providers = this.generateNetworkProviders(network);
      this.networkWithProviderByChainId.set(Number(network.chain_id), {
        ...network,
        providers,
      });
    });
  }

  /**
   * 네트워크 provider
   * @param chainId chainId
   * @returns random network provider
   */
  provider(chainId: number): Provider {
    return randomPick(this.providers(chainId));
  }

  /**
   * 네트워크 providers
   * @param chainId chainId
   * @returns network providers
   */
  providers(chainId: number): Provider[] {
    return this.networkWithProviderByChainId.get(chainId).providers;
  }

  /**
   * 네트워크 Multicall address
   * @param chainId chainId
   * @returns network multicall address
   */
  multiCallAddress(chainId: number): string {
    return this.networkWithProviderByChainId.get(chainId).multi_call_address;
  }

  async findNetwork(
    where?: { [K in keyof any]?: any[K] | FindOperator<any[K]> },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Network> {
    return this.networkRepository._findOne(where, manager);
  }

  async findNetworks(
    where?: {
      [K in keyof any]?: any[K] | FindOperator<any[K]>;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<Network[]> {
    return this.networkRepository._findAll(where, manager);
  }

  async updateNetwork(
    where: { [K in keyof Network]?: Network[K] | FindOperator<Network[K]> },
    set: { [K in keyof Network]?: Network[K] },
    @TransactionManager() manager?: EntityManager,
  ): Promise<UpdateResult> {
    if (manager) {
      return manager.update(Network, where, set);
    }
    return this.networkRepository.update(where, set);
  }

  async search(params: NetworkSearchQuery): Promise<Network[]> {
    return this.networkRepository._search(params);
  }

  /**
   * 네트워크 providers 생성
   * @param network Network Entity
   * @returns Network providers
   */
  generateNetworkProviders(network: Network): Provider[] {
    const providers: Provider[] = [];

    const http = JSON.parse(JSON.parse(JSON.stringify(network.http)));

    for (const { type, url } of http) {
      let provider: Provider;
      if (type === 'OCTET') {
        provider = new ethers.providers.JsonRpcProvider({
          url,
          headers: {
            Authorization: `Bearer ${config.octetToken}`,
          },
        });
      } else {
        provider = new ethers.providers.JsonRpcProvider({ url });
      }

      providers.push(provider);
    }

    return providers;
  }
}
