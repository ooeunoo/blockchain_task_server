import { Injectable } from '@nestjs/common';
import { In, IsNull, Not } from 'typeorm';
import { NetworkService } from '../../network/network.service';
import { TokenService } from '../../token/token.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { PriceTemplate } from '../template/price.template';
import { ID } from '../scheduler-job.constant';
import { Token } from '@libs/repository/token/entity';
import { TokenType } from '@libs/repository/token/constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { NULL_BYTE, ZERO, ZERO_ADDRESS } from '@libs/helper/constant';
import { div, isGreaterThan, mul, toFixed } from '@libs/helper/bignumber';
import { flat, groupBy, toSplitWithChunkSize } from '@libs/helper/array';
import { isNull, isNullBytes } from '@libs/helper/type';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { ERC20_ABI } from '@libs/helper/erc20';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { divideDecimals } from '@libs/helper/decimals';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

interface ExtendTokenOther extends Token {
  other: Token | null;
}

@Injectable()
export class TokenPriceSingleAMMService extends PriceTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly networkService: NetworkService,
  ) {
    super(
      ID.PRICE.SINGLE_AMM,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      tokenService,
      networkService,
    );
  }

  async getTokens(): Promise<Token[]> {
    return this.tokenService.findTokens({
      type: In([TokenType.SINGLE, TokenType.NATIVE]),
      price_address: IsNull(),
      status: true,
      network: {
        status: true,
      },
    });
  }

  async findConfiguredPairs(token: Token): Promise<Token[] | null> {
    const commonCondition = {
      type: TokenType.MULTI,
      total_supply: Not(ZERO.toString()),
      price_value: Not(ZERO.toString()),
      status: true,
      network: { status: true },
    };

    return this.tokenService.findTokens([
      {
        pair0: token,
        ...commonCondition,
      },
      {
        pair1: token,
        ...commonCondition,
      },
    ]);
  }

  findHighestLiquidityPair(configuredPairs: Token[]): Token | null {
    let bestPair = null;
    let maxLiquidity = ZERO;
    configuredPairs.forEach((pair: Token) => {
      const { total_supply, price_value } = pair;
      const liquidity = mul(total_supply, price_value);
      if (isGreaterThan(liquidity, maxLiquidity)) {
        bestPair = pair;
        maxLiquidity = liquidity;
      }
    });

    return bestPair;
  }

  async crawlTokenSupplyAndPrice(
    chainId: number,
    targetTokens: Token[],
  ): Promise<{ id; values: { price_value: string; total_supply: string } }[]> {
    const targetMultiCallAddress =
      this.networkService.multiCallAddress(chainId);
    const targetProvider = this.networkService.provider(chainId);

    const infoEncode = await Promise.all(
      targetTokens.map(async (token: ExtendTokenOther) => {
        const { id, address } = token;
        const pairs = await this.findConfiguredPairs(token);
        const targetPair = this.findHighestLiquidityPair(pairs);

        token.other = null;
        if (isNull(targetPair)) {
          return [
            [address, encodeFunction(ERC20_ABI, 'totalSupply')],
            [ZERO_ADDRESS, NULL_BYTE],
            [ZERO_ADDRESS, NULL_BYTE],
          ];
        } else {
          const otherToken =
            targetPair.pair0.id === id ? targetPair.pair1 : targetPair.pair0;

          token.other = otherToken;

          return [
            [address, encodeFunction(ERC20_ABI, 'totalSupply')],
            [
              address,
              encodeFunction(ERC20_ABI, 'balanceOf', [targetPair.address]),
            ],
            [
              otherToken.address,
              encodeFunction(ERC20_ABI, 'balanceOf', [targetPair.address]),
            ],
          ];
        }
      }),
    );

    const infoBatchCall = await getBatchStaticAggregator(
      targetProvider,
      targetMultiCallAddress,
      flat(infoEncode),
    );
    const infoBatchCallMap = toSplitWithChunkSize(infoBatchCall, 3);

    const updateParams = [];

    await Promise.all(
      targetTokens.map((token: ExtendTokenOther, index: number) => {
        const { id, decimals, other } = token;
        const targetInfoResult = infoBatchCallMap[index];

        if (isNull(other)) return;

        const [
          {
            success: targetTokenTotalSupplySuccess,
            returnData: targetTokenTotalSupplyData,
          },
          {
            success: targetTokenBalanceSuccess,
            returnData: targetTokenBalanceData,
          },
          {
            success: otherTokenBalanceSuccess,
            returnData: otherTokenBalanceData,
          },
        ] = targetInfoResult;

        const targetTokenTotalSupply =
          targetTokenTotalSupplySuccess &&
          !isNullBytes(targetTokenTotalSupplyData)
            ? divideDecimals(
                decodeFunctionResultData(
                  ERC20_ABI,
                  'totalSupply',
                  targetTokenTotalSupplyData,
                ),
                decimals,
              )
            : ZERO;

        const targetTokenBalance =
          targetTokenBalanceSuccess && !isNullBytes(targetTokenBalanceData)
            ? divideDecimals(
                decodeFunctionResultData(
                  ERC20_ABI,
                  'balanceOf',
                  targetTokenBalanceData,
                ),
                decimals,
              )
            : ZERO;

        const otherTokenBalance =
          otherTokenBalanceSuccess && !isNullBytes(otherTokenBalanceData)
            ? divideDecimals(
                decodeFunctionResultData(
                  ERC20_ABI,
                  'balanceOf',
                  otherTokenBalanceData,
                ),
                other.decimals,
              )
            : ZERO;

        const otherTokenValueInPair = mul(otherTokenBalance, other.price_value);
        const targetTokenValue = div(otherTokenValueInPair, targetTokenBalance);

        updateParams.push({
          id,
          values: {
            price_value: toFixed(targetTokenValue),
            total_supply: targetTokenTotalSupply.toString(),
          },
        });
      }),
    );
    return updateParams;
  }
}
