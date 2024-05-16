import { Injectable } from '@nestjs/common';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '../../../libs/helper/src/array';
import { getBatchStaticAggregator } from '../../../libs/helper/src/batch-contract';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '../../../libs/helper/src/encodeDecode';
import { PAIR_ABI } from '../../../libs/helper/src/pair';
import { KlaySwapKLAYTNService } from '../../defi/klay-swap/klay-swap.klaytn.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { PairTemplate } from '../template/pair.template';

@Injectable()
export class KlaySwapKLAYTNPairService extends PairTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly context: KlaySwapKLAYTNService,
  ) {
    super(
      ID.KLAY_SWAP.KLAYTN.PAIR,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      tokenService,
      context,
    );
  }

  onModuleInit(): Promise<void> {
    return;
  }

  // override
  // klayswap interface is not matched uniswap factory
  async getPairsInfo(multiTokens: string[]) {
    const pairsInfoEncode = multiTokens.map((address) => {
      return [
        [address, encodeFunction(PAIR_ABI, 'tokenA')],
        [address, encodeFunction(PAIR_ABI, 'tokenB')],
      ];
    });

    const pairsInfoBatchCall = await getBatchStaticAggregator(
      this.context.provider,
      this.context.multiCallAddress,
      flat(pairsInfoEncode),
    );

    const pairsInfoBatchCallMap = toSplitWithChunkSize(pairsInfoBatchCall, 2);

    const pairsInfoBatchCallMapZip = zip(multiTokens, pairsInfoBatchCallMap);

    return pairsInfoBatchCallMapZip.map(([pair, pairsInfoBatchResult]) => {
      const [
        { success: tokenASuccess, returnData: tokenAData },
        { success: tokenBSuccess, returnData: tokenBData },
      ] = pairsInfoBatchResult;

      const tokenA = validResult(tokenASuccess, tokenAData)
        ? decodeFunctionResultData(PAIR_ABI, 'tokenA', tokenAData)[0]
        : null;

      const tokenB = validResult(tokenBSuccess, tokenBData)
        ? decodeFunctionResultData(PAIR_ABI, 'tokenB', tokenBData)[0]
        : null;

      return {
        pair,
        token0: tokenA,
        token1: tokenB,
      };
    });
  }
}
