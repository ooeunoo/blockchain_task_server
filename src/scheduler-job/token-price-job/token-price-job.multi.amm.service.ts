import { Injectable } from '@nestjs/common';
import { TokenType } from '@libs/repository/token/constant';
import { NetworkService } from '../../network/network.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { PriceTemplate } from '../template/price.template';
import { Token } from '@libs/repository/token/entity';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { flat, toSplitWithChunkSize } from '@libs/helper/array';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { div, isZero, mul, toFixed } from '@libs/helper/bignumber';
import { ZERO, ZERO_ADDRESS } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { isNull, isNullBytes } from '@libs/helper/type';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { ERC20_ABI } from '@libs/helper/erc20';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';

interface ExtendTokenKeyPair extends Token {
  keyPair: Token | null;
}

@Injectable()
export class TokenPriceMultiAMMService extends PriceTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly networkService: NetworkService,
  ) {
    super(
      ID.PRICE.MULTI_AMM,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      tokenService,
      networkService,
    );
  }

  async getTokens(): Promise<Token[]> {
    return this.tokenService.findTokens({
      type: TokenType.MULTI,
      status: true,
      network: {
        status: true,
      },
    });
  }

  findKeyPair(pair0: Token, pair1: Token): Token | null {
    const [pair0Price, pair1Price, pair0PriceAddress, pair1PriceAddress] = [
      pair0.price_value,
      pair1.price_value,
      pair0.price_address,
      pair1.price_address,
    ];

    return !isNull(pair0) && !isNull(pair0PriceAddress) && !isNull(pair0Price)
      ? pair0
      : !isNull(pair1) && !isNull(pair1PriceAddress) && !isNull(pair1Price)
      ? pair1
      : null;
  }

  async crawlTokenSupplyAndPrice(
    chainId: number,
    targetTokens: Token[],
  ): Promise<{ id; values: { price_value: string; total_supply: string } }[]> {
    const targetMultiCallAddress =
      this.networkService.multiCallAddress(chainId);
    const targetProvider = this.networkService.provider(chainId);

    const infoEncode = targetTokens.map((token: ExtendTokenKeyPair) => {
      const { address, pair0, pair1 } = token;

      const keyPair: Token | null = this.findKeyPair(pair0, pair1);
      token.keyPair = keyPair;

      if (isNull(keyPair)) {
        return [
          [ZERO_ADDRESS, ZERO_ADDRESS],
          [ZERO_ADDRESS, ZERO_ADDRESS],
        ];
      } else {
        return [
          [address, encodeFunction(ERC20_ABI, 'totalSupply')],
          [keyPair.address, encodeFunction(ERC20_ABI, 'balanceOf', [address])],
        ];
      }
    });

    const infoBatchCall = await getBatchStaticAggregator(
      targetProvider,
      targetMultiCallAddress,
      flat(infoEncode),
    );

    const infoBatchCallMap = toSplitWithChunkSize(infoBatchCall, 2);

    const updateParams = [];
    await Promise.all(
      targetTokens.map((token: ExtendTokenKeyPair, index: number) => {
        const { id, decimals, keyPair } = token;

        if (isNull(keyPair)) return;

        const [
          {
            success: multiTokenTotalSupplySuccess,
            returnData: multiTokenTotalSupplyData,
          },
          {
            success: keyPairTokenBalanceSuccess,
            returnData: keyPairTokenBalanceData,
          },
        ] = infoBatchCallMap[index];

        const multiTokenTotalSupply =
          multiTokenTotalSupplySuccess &&
          !isNullBytes(multiTokenTotalSupplyData)
            ? divideDecimals(
                decodeFunctionResultData(
                  ERC20_ABI,
                  'totalSupply',
                  multiTokenTotalSupplyData,
                ),
                decimals,
              )
            : ZERO;

        const keyPairTokenBalance =
          keyPairTokenBalanceSuccess && !isNullBytes(keyPairTokenBalanceData)
            ? divideDecimals(
                decodeFunctionResultData(
                  ERC20_ABI,
                  'balanceOf',
                  keyPairTokenBalanceData,
                ),
                decimals,
              )
            : ZERO;

        const keyPairTotalValue = mul(keyPairTokenBalance, keyPair.price_value);
        const multiTokenTotalValue = mul(keyPairTotalValue, 2);

        const multiTokenValue = isZero(multiTokenTotalSupply)
          ? ZERO
          : div(multiTokenTotalValue, multiTokenTotalSupply);

        updateParams.push({
          id,
          values: {
            price_value: toFixed(multiTokenValue),
            total_supply: multiTokenTotalSupply.toString(),
          },
        });
      }),
    );
    return updateParams;
  }
}
