import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  Token as TokenInstance,
  Currency,
  CurrencyAmount,
  TradeType,
  Percent,
} from '@uniswap/sdk-core';
import { Pair, Trade } from '@uniswap/v2-sdk';
import { TokenService } from '../token/token.service';
import { NetworkService } from '../network/network.service';
import { ProtocolService } from '../protocol/protocol.service';
import { DefiService } from '../defi/defi.service';
import { Protocol } from '@libs/repository/protocol/entity';
import { Token } from '@libs/repository/token/entity';
import {
  computePairAddress,
  isAddress,
  isZeroAddress,
} from '@libs/helper/address';
import { isBytes32, isNullBytes, isUndefined } from '@libs/helper/type';
import { flat, toSplitWithChunkSize, zip } from '@libs/helper/array';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { PAIR_ABI } from '@libs/helper/pair';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { multiplyDecimals } from '@libs/helper/decimals';

@Injectable()
export class SwapService implements OnApplicationBootstrap {
  public protocolWithService = new Map<number, any>();

  constructor(
    private readonly networkService: NetworkService,
    private readonly protocolService: ProtocolService,
    private readonly tokenService: TokenService,
    private readonly defiService: DefiService,
  ) {}

  // 모든 모듈이 초기화된 후 연결을 수신하기 전에 호출.
  async onApplicationBootstrap() {
    const items = await this.protocolService.search({
      useAMM: true,
    });

    items.forEach((protocol: Protocol) => {
      const service = this.defiService.getService(protocol.id);

      const { ammFactoryAddress, ammFactoryInitCodeHash } = service;

      if (isAddress(ammFactoryAddress) && isBytes32(ammFactoryInitCodeHash)) {
        const serviceInChainId = this.protocolWithService.get(service.chainId);

        if (isUndefined(serviceInChainId)) {
          this.protocolWithService.set(service.chainId, [
            { protocol, service },
          ]);
        } else {
          this.protocolWithService.set(service.chainId, [
            ...serviceInChainId,
            { protocol, service },
          ]);
        }
      }
    });
  }

  /**
   * search swap list
   * @param chainId chain id
   * @param inputToken input token for swap
   * @param outputToken output token for swap
   * @param amount input token amount
   * @returns return output amount with protocol
   */
  async search(
    chainId: number,
    inputToken: Token,
    outputToken: Token,
    inputAmount: string,
  ) {
    const [isNativeInputToken, isNativeOutputToken] = [
      isZeroAddress(inputToken.address),
      isZeroAddress(outputToken.address),
    ];

    const [inputTokenInstance, outputTokenInstance] =
      this.getInOutPutTokenInstances(
        Number(chainId),
        isNativeInputToken ? inputToken.wrapped : inputToken,
        isNativeOutputToken ? outputToken.wrapped : outputToken,
      );

    const commonPath = await this.getCommonPathTokenInstances(Number(chainId));

    const allCurrencyCombinations = this.getAllCurrencyCombinations(
      inputTokenInstance,
      outputTokenInstance,
      commonPath,
    );

    const allowedProtocolWithPairs = await this.getProtocolPairs(
      Number(chainId),
      allCurrencyCombinations,
    );

    const bestTradeEachProtocol = [];

    allowedProtocolWithPairs.forEach(({ protocol, pairList }) => {
      const amount = multiplyDecimals(inputAmount, inputToken.decimals);

      const bestTrade = this.getBestTrade(
        inputTokenInstance,
        outputTokenInstance,
        pairList,
        amount,
      );
      if (!isUndefined(bestTrade)) {
        bestTradeEachProtocol.push({
          protocol,
          inputToken,
          outputToken,
          input_amount: inputAmount,
          output_amount: bestTrade.outputAmount.toFixed(),
        });
      }
    });

    return bestTradeEachProtocol;
  }

  /**
   * Token Entity => Token Instance
   * @param chainId chain id
   * @param inputToken input token
   * @param outputToken output token
   * @returns input output token instance
   */
  private getInOutPutTokenInstances(
    chainId: number,
    inputToken: Token,
    outputToken: Token,
  ): [TokenInstance, TokenInstance] {
    return [
      new TokenInstance(
        chainId,
        inputToken.address,
        inputToken.decimals,
        inputToken.symbol,
        inputToken.name,
      ),
      new TokenInstance(
        chainId,
        outputToken.address,
        outputToken.decimals,
        outputToken.symbol,
        outputToken.name,
      ),
    ];
  }

  /**
   * Get Network Common path <swap_base: true in token table >
   * @param chainId chain id
   * @returns network common path token
   */
  private async getCommonPathTokenInstances(chainId: number) {
    const baseSwapToken = await this.tokenService.findTokens({
      status: true,
      swap_base: true,
    });

    const baseSwapTokenInstances = baseSwapToken.map(
      ({ address, decimals, symbol, name }) =>
        new TokenInstance(chainId, address, decimals, symbol, name),
    );

    return baseSwapTokenInstances;
  }

  /**
   * protocol with factory
   * @param chainId chain id
   * @returns protocol with factory info(address, init code hash)
   */
  private getProtocolWithFactoryInfos(chainId: number) {
    const protocolService = this.protocolWithService.get(chainId);

    return protocolService.map(
      ({
        protocol,
        service: { ammFactoryAddress, ammFactoryInitCodeHash },
      }) => {
        return {
          protocol,
          ammFactoryAddress,
          ammFactoryInitCodeHash,
        };
      },
    );
  }

  /**
   * Get all combination pair
   * @param tokenA tokenA of pair
   * @param tokenB tokenB of pair
   * @param commonPath network common path token
   * @returns [TokenInstance, TokenInstance]
   */
  private getAllCurrencyCombinations = (
    tokenA: TokenInstance,
    tokenB: TokenInstance,
    commonPath: TokenInstance[],
  ): [TokenInstance, TokenInstance][] => {
    const basePairs: [TokenInstance, TokenInstance][] = commonPath
      .flatMap((base): [TokenInstance, TokenInstance][] =>
        commonPath.map((otherBase) => [base, otherBase]),
      )
      .filter(([t0, t1]) => !t0.equals(t1));
    return (
      [
        // the direct pair
        [tokenA, tokenB] as [TokenInstance, TokenInstance],
        // token A against all bases
        ...commonPath.map((base): [TokenInstance, TokenInstance] => [
          tokenA,
          base,
        ]),
        // token B against all bases
        ...commonPath.map((base): [TokenInstance, TokenInstance] => [
          tokenB,
          base,
        ]),
        // each base against all bases
        ...basePairs,
      ]
        .filter(([t0, t1]) => !t0.equals(t1))
        // filter out duplicate pairs
        .filter(([t0, t1], i, otherPairs) => {
          // find the first index in the array at which there are the same 2 tokens as the current
          const firstIndexInOtherPairs = otherPairs.findIndex(
            ([t0Other, t1Other]) => {
              return (
                (t0.equals(t0Other) && t1.equals(t1Other)) ||
                (t0.equals(t1Other) && t1.equals(t0Other))
              );
            },
          );

          // only accept the first occurence of the same 2 tokens
          return firstIndexInOtherPairs === i;
        })
        .map(([t0, t1]) => (t0.sortsBefore(t1) ? [t0, t1] : [t1, t0]))
    );
  };

  /**
   * pair each protocol
   * @param chainId chain id
   * @param tokens all combination pairs
   * @returns pair info each protocol
   */
  private async getProtocolPairs(
    chainId: number,
    tokens: [TokenInstance, TokenInstance][],
  ): Promise<{ protocol: Protocol; pairList: Pair[] }[]> {
    const protocolWithFactories: {
      protocol: Protocol;
      ammFactoryAddress: string;
      ammFactoryInitCodeHash: string;
    }[] = this.getProtocolWithFactoryInfos(chainId);

    const pairsOfEachFactory = protocolWithFactories.map(
      ({ ammFactoryAddress, ammFactoryInitCodeHash }) => {
        return tokens.map(([tokenA, tokenB]) => {
          return computePairAddress(
            ammFactoryAddress,
            ammFactoryInitCodeHash,
            tokenA.address,
            tokenB.address,
          );
        });
      },
    );

    const pairAddresses = flat(pairsOfEachFactory);

    const reserveInfoEncode = pairAddresses.map((address) => [
      address,
      encodeFunction(PAIR_ABI, 'getReserves'),
    ]);

    const [provider, multiCallAddress] = [
      this.networkService.provider(chainId),
      this.networkService.multiCallAddress(chainId),
    ];

    const reserveInfoBatchCall = await getBatchStaticAggregator(
      provider,
      multiCallAddress,
      reserveInfoEncode,
    );

    const reserveInfoBatchCallMap = toSplitWithChunkSize(
      reserveInfoBatchCall,
      tokens.length,
    );

    const reserveInfoBatchCallMapZip = zip(
      protocolWithFactories,
      reserveInfoBatchCallMap,
    );

    const reserveResult = [];

    reserveInfoBatchCallMapZip.forEach(
      ([protocolWithFactories, protocolReserveResult], protocolIndex) => {
        reserveResult[protocolIndex] = {
          protocol: protocolWithFactories.protocol,
          pairs: [],
        };

        protocolReserveResult.map(
          ({ success, returnData }, reserveIndex: number) => {
            if (success && !isNullBytes(returnData)) {
              const reserveDecode = decodeFunctionResultData(
                PAIR_ABI,
                'getReserves',
                returnData,
              );

              reserveResult[protocolIndex].pairs.push({
                reserves0: reserveDecode.reserve0,
                reserves1: reserveDecode.reserve1,
                index: reserveIndex,
              });
            }
          },
        );
      },
    );

    return reserveResult.map(({ protocol, pairs }) => {
      const pairList = pairs.map(({ reserves0, reserves1, index }) => {
        return new Pair(
          CurrencyAmount.fromRawAmount(tokens[index][0], reserves0.toString()),
          CurrencyAmount.fromRawAmount(tokens[index][1], reserves1.toString()),
        );
      });
      return {
        protocol,
        pairList,
      };
    });
  }

  /**
   * search best trade pair with output amount
   * @param inputToken input token
   * @param outputToken output token
   * @param pairs pairs
   * @param inputAmount amount
   * @returns search best trade
   */
  private getBestTrade(
    inputToken: Currency,
    outputToken: Currency,
    pairs: Pair[],
    inputAmount: string,
  ): Trade<Currency, Currency, TradeType> {
    // 최대 경로 3
    const maxHops = 3;

    const amountSpecified = CurrencyAmount.fromRawAmount(
      inputToken,
      inputAmount,
    );

    let bestTrade: Trade<Currency, Currency, TradeType>;

    for (let i = 1; i <= maxHops; i++) {
      const options = { maxHops: i, maxNumResult: 1 };
      const amountIn = amountSpecified;
      console.log(pairs);
      const currentTrade =
        Trade.bestTradeExactIn(pairs, amountIn, outputToken, options)[0] ??
        null;

      // if current trade is best yet, save it
      if (
        this.isTradeBetter(bestTrade, currentTrade, new Percent('50', '10000'))
      ) {
        bestTrade = currentTrade;
      }
    }
    return bestTrade;
  }

  /**
   * compare trade info
   * @param tradeA before best trade
   * @param tradeB this trade
   * @param minimumDelta percentage
   * @returns
   */
  private isTradeBetter(
    tradeA: Trade<Currency, Currency, TradeType>,
    tradeB: Trade<Currency, Currency, TradeType>,
    minimumDelta: Percent = new Percent('0'),
  ): boolean {
    if (tradeA && !tradeB) return false;
    if (tradeB && !tradeA) return true;
    if (!tradeA || !tradeB) return undefined;
    // if (
    //   tradeA.tradeType !== tradeB.tradeType ||
    //   !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    //   !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency)
    // ) {
    //   throw new Error('');
    // }

    if (minimumDelta.equalTo(new Percent('0'))) {
      return tradeA.executionPrice.lessThan(tradeB.executionPrice);
    } else {
      return tradeA.executionPrice.asFraction
        .multiply(minimumDelta.add(new Percent('1')))
        .lessThan(tradeB.executionPrice);
    }
  }
}
