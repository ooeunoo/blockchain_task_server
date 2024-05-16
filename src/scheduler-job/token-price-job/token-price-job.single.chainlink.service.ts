import { Injectable } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { NetworkService } from '../../network/network.service';
import { TokenService } from '../../token/token.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { ID } from '../scheduler-job.constant';
import { PriceTemplate } from '../template/price.template';
import { Token } from '@libs/repository/token/entity';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import {
  getBatchChainLinkData,
  getBatchERC20TotalSupply,
} from '@libs/helper/batch-contract';
import { isZero, toFixed } from '@libs/helper/bignumber';
import { divideDecimals } from '@libs/helper/decimals';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';

@Injectable()
export class TokenPriceSingleChainLinkService extends PriceTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly networkService: NetworkService,
  ) {
    super(
      ID.PRICE.SINGLE_CHAIN_LINK,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      tokenService,
      networkService,
    );
  }

  async getTokens(): Promise<Token[]> {
    return this.tokenService.findTokens({
      price_address: Not(IsNull()),
      status: true,
      network: {
        status: true,
      },
    });
  }

  async crawlTokenSupplyAndPrice(
    chainId: number,
    targetTokens: Token[],
  ): Promise<{ id; values: { price_value: string; total_supply: string } }[]> {
    const targetMultiCallAddress =
      this.networkService.multiCallAddress(chainId);
    const targetProvider = this.networkService.provider(chainId);

    const addresses = [];
    const feeds = [];

    targetTokens.forEach(({ address, price_address }) => {
      addresses.push(address);
      feeds.push(price_address);
    });

    const [totalSupplies, chainLinkData] = await Promise.all([
      getBatchERC20TotalSupply(
        targetProvider,
        targetMultiCallAddress,
        addresses,
      ),
      getBatchChainLinkData(targetProvider, targetMultiCallAddress, feeds),
    ]);

    const updateParams: {
      id: number;
      values: { price_value: string; total_supply: string };
    }[] = [];

    await Promise.all(
      targetTokens.map(async ({ id, decimals }, index) => {
        const { answer, decimals: chainLinkDecimals } = chainLinkData[index];
        const pureTotalSupply = totalSupplies[index];

        if (isZero(answer) || isZero(chainLinkDecimals)) return;

        const priceValue = divideDecimals(answer, chainLinkDecimals);
        const totalSupply = divideDecimals(pureTotalSupply, decimals);
        updateParams.push({
          id,
          values: {
            price_value: toFixed(priceValue),
            total_supply: totalSupply.toString(),
          },
        });
      }),
    );
    return updateParams;
  }
}
