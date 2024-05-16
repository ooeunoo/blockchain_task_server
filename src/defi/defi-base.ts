import { OnModuleInit } from '@nestjs/common';
import { In } from 'typeorm';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Token } from '@libs/repository/token/entity';
import { Abi } from '@libs/repository/abi/entity';
import { Network } from '@libs/repository/network/entity';
import { Protocol } from '@libs/repository/protocol/entity';
import { randomPick } from '@libs/helper/array';
import { isUndefined } from '@libs/helper/type';
import { TokenService } from '../token/token.service';
import { InteractionService } from '../interaction/interaction.service';
import { NetworkService } from '../network/network.service';
import { ProtocolService } from '../protocol/protocol.service';
import { AbiService } from '../abi/abi.service';
import { Exception } from '../common/exceptions/exception.service';
import { ExceptionCode } from '../common/exceptions/exception.constant';

export class DeFiBase implements OnModuleInit {
  public isDeFiService = true;

  public name: string;
  public chainId: number;
  public constants: { [key: string]: any };

  public network: Network;
  public protocol: Protocol;
  public token?: Token;
  public providers: Provider[];

  // Search ABI by address
  public addressABI = new Map<string, any>();

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.network = await this.networkService.findNetwork({
      chain_id: this.chainId,
    });

    this.protocol = await this.protocolService.findProtocol({
      name: this.name,
      network: this.network,
    });

    this.token = this.protocol.token;
    this.providers = this.networkService.generateNetworkProviders(this.network);

    await this._injectABI();
  }

  get provider(): Provider {
    return this.providers.length > 0 ? randomPick(this.providers) : null;
  }

  getBalance(address: string): Promise<BigNumber> {
    return this.provider.getBalance(address);
  }

  get blockTimeSecond(): number {
    return this.network.block_time_sec;
  }

  get multiCallAddress(): string {
    return this.network.multi_call_address;
  }

  get useFarm(): boolean {
    return this.protocol.use_farm;
  }

  get useLending(): boolean {
    return this.protocol.use_lending;
  }

  get useAmm(): boolean {
    return this.protocol.use_amm;
  }

  get useNFT(): boolean {
    return this.protocol.use_nft;
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  private async _injectABI(): Promise<void> {
    // TODO: Change if value address inject abi
    for await (const {
      address,
      sample_address,
      factory_address,
      router_address,
      v_token_sample_address,
      bento_address,
      kashi_address,
    } of Object.values(this.constants)) {
      try {
        const findABIAddress = [];

        if (!isUndefined(address)) {
          findABIAddress.push(address);
        }

        if (!isUndefined(sample_address)) {
          findABIAddress.push(sample_address);
        }

        if (!isUndefined(factory_address)) {
          findABIAddress.push(factory_address);
        }

        if (!isUndefined(router_address)) {
          findABIAddress.push(router_address);
        }

        if (!isUndefined(v_token_sample_address)) {
          findABIAddress.push(v_token_sample_address);
        }

        if (!isUndefined(bento_address)) {
          findABIAddress.push(bento_address);
        }

        if (!isUndefined(kashi_address)) {
          findABIAddress.push(kashi_address);
        }

        const abiEntity = await this.abiService.findAbis({
          network: this.network,
          address: In(findABIAddress),
        });

        abiEntity.forEach((entity: Abi) => {
          this.addressABI.set(entity.address, entity.getABI());
        });
      } catch (e) {
        throw new Exception(ExceptionCode.ERR800, { data: JSON.stringify(e) });
      }
    }
  }
}
