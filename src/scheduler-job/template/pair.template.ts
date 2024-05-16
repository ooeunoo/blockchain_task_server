import { BigNumber } from '@ethersproject/bignumber';
import {
  EntityManager,
  getConnection,
  In,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { SchedulerJobBase } from '../scheduler-job.base';
import { TokenService } from '../../token/token.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenType } from '@libs/repository/token/constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { fillSequenceNumber, removeStringValues } from '@libs/helper/array';
import {
  getBatchCheckCA,
  getBatchERC20TokenInfos,
  getBatchPairInfos,
  getSafeERC20TokenInfo,
  getSafePairInfos,
} from '@libs/helper/batch-contract';
import {
  add,
  isGreaterThan,
  isGreaterThanOrEqual,
  sub,
} from '@libs/helper/bignumber';
import {
  UNKNOWN_STRING,
  UNKNOWN_UINT256,
  ZERO_ADDRESS,
} from '@libs/helper/constant';
import { getPairTokenSymbol } from '@libs/helper/naming';
import { isNull, isUndefined } from '@libs/helper/type';
import { isZeroAddress, toCheckSumAddress } from '@libs/helper/address';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

export abstract class PairTemplate extends SchedulerJobBase {
  constructor(
    public readonly id: string,
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly context,
  ) {
    super(
      id,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
    );
  }

  async networkPid(): Promise<BigNumber> {
    return this.context.getAMMFactoryTotalLength();
  }

  async schedulerPid(): Promise<number> {
    const scheduler = await this.schedulerService.findScheduler({
      id: this.id,
    });

    if (isUndefined(scheduler)) {
      throw new Error('Not found scheduler');
    }

    return scheduler.pid || 0;
  }

  grouping(pairInfos: any[]): {
    uniqueMultiTokenAddresses: string[];
    uniqueSingleTokenAddresses: string[];
  } {
    const multi = [];
    const single = [];

    pairInfos.forEach(({ pair, token0, token1 }) => {
      multi.push(pair);
      single.push(token0);
      single.push(token1);
    });

    return {
      uniqueMultiTokenAddresses: [...new Set(multi)],
      uniqueSingleTokenAddresses: [...new Set(single)],
    };
  }

  async removeRegisteredTokens(
    multiTokenAddresses: string[],
    singleTokenAddresses: string[],
  ): Promise<{
    newMultiTokenAddresses: string[];
    newSingleTokenAddresses: string[];
  }> {
    const [registeredMultiTokens, registeredSingleTokens] = await Promise.all([
      this.tokenService.findTokens({
        network: this.context.network,
        address: In(multiTokenAddresses),
      }),
      this.tokenService.findTokens({
        network: this.context.network,
        address: In(singleTokenAddresses),
      }),
    ]);

    const [registeredMultiTokenAddresses, registeredSingleTokenAddresses] = [
      registeredMultiTokens.map(({ address }) => address),
      registeredSingleTokens.map(({ address }) => address),
    ];

    const [newMultiTokenAddresses, newSingleTokenAddresses] = [
      removeStringValues(multiTokenAddresses, registeredMultiTokenAddresses),
      removeStringValues(singleTokenAddresses, registeredSingleTokenAddresses),
    ];

    return { newMultiTokenAddresses, newSingleTokenAddresses };
  }

  async removeInvalidTokens(
    multiTokenAddresses: string[],
    singleTokenAddresses: string[],
  ): Promise<{
    validMultiTokenAddresses: string[];
    validSingleTokenAddresses: string[];
    invalidSingleTokenAddresses: string[];
  }> {
    // remove same multi token in single position
    singleTokenAddresses = removeStringValues(
      singleTokenAddresses,
      multiTokenAddresses,
    );

    singleTokenAddresses = singleTokenAddresses.map((address) =>
      toCheckSumAddress(address),
    );

    const singleTokenCheckCA = await getBatchCheckCA(
      this.context.provider,
      this.context.multiCallAddress,
      singleTokenAddresses,
    );

    const invalidSingleTokenAddresses = [];

    const validSingleTokenAddresses = singleTokenAddresses.filter(
      (address: string, index: number) => {
        if (!singleTokenCheckCA[index]) {
          invalidSingleTokenAddresses.push(address);
        }

        return singleTokenCheckCA[index];
      },
    );

    return {
      validMultiTokenAddresses: multiTokenAddresses,
      validSingleTokenAddresses,
      invalidSingleTokenAddresses,
    };
  }

  async checkMultiTokenInSinglePosition(
    multiTokenAddresses: string[],
    singleTokenAddresses: string[],
    invalidSingleTokenAddresses: string[],
  ): Promise<{
    pureMultiTokenAddresses: string[];
    pureSingleTokenAddresses: string[];
    pureInvalidSingleTokenAddresses: string[];
  }> {
    let checkMultiInfos = [];
    try {
      checkMultiInfos = await getBatchPairInfos(
        this.context.provider,
        this.context.multiCallAddress,
        singleTokenAddresses,
      );
    } catch (e) {
      checkMultiInfos = await Promise.all(
        singleTokenAddresses.map(async (address) => {
          try {
            return getSafePairInfos(
              this.context.provider,
              this.context.multiCallAddress,
              address,
            );
          } catch (e) {
            return {
              pair: address,
              token0: ZERO_ADDRESS,
              token1: ZERO_ADDRESS,
              weird: true,
            };
          }
        }),
      );
    }

    const pureSingleTokenAddresses = [];

    checkMultiInfos.map(
      async (infos: {
        pair: string;
        token0: string;
        token1: string;
        weird?: boolean;
      }) => {
        const { pair, token0, token1, weird } = infos;

        // weird token, (case1, Infinite loop when calling name, etc)
        if (weird) {
          invalidSingleTokenAddresses.push(pair);
        }

        // pure single
        else if (isZeroAddress(token0) && isZeroAddress(token1)) {
          pureSingleTokenAddresses.push(pair);
        }

        // multi token in single position
        else {
          invalidSingleTokenAddresses.push(pair);
        }
      },
    );

    return {
      pureMultiTokenAddresses: multiTokenAddresses,
      pureSingleTokenAddresses,
      pureInvalidSingleTokenAddresses: invalidSingleTokenAddresses,
    };
  }

  async getTokenInfos(
    multiTokenAddresses: string[],
    singleTokenAddresses: string[],
  ): Promise<{ multiTokenInfos; singleTokenInfos }> {
    let multiTokenInfos = [];
    let singleTokenInfos = [];

    try {
      multiTokenInfos = await getBatchERC20TokenInfos(
        this.context.provider,
        this.context.multiCallAddress,
        multiTokenAddresses,
      );
    } catch (e) {
      const allSettled = await Promise.allSettled(
        multiTokenAddresses.map(async (address) => {
          return getSafeERC20TokenInfo(
            this.context.provider,
            this.context.multiCallAddress,
            address,
          );
        }),
      );

      multiTokenInfos = allSettled.map((result) => {
        const { status } = result;
        if (status === 'fulfilled') {
          return {
            name: result.value.name,
            symbol: result.value.symbol,
            decimals: result.value.decimals,
          };
        } else {
          return {
            name: UNKNOWN_STRING,
            symbol: UNKNOWN_STRING,
            decimals: UNKNOWN_UINT256,
          };
        }
      });
    }

    try {
      singleTokenInfos = await getBatchERC20TokenInfos(
        this.context.provider,
        this.context.multiCallAddress,
        singleTokenAddresses,
      );
    } catch (e) {
      const allSettled = await Promise.allSettled(
        singleTokenAddresses.map(async (address) => {
          return getSafeERC20TokenInfo(
            this.context.provider,
            this.context.multiCallAddress,
            address,
          );
        }),
      );
      singleTokenInfos = allSettled.map((result) => {
        const { status } = result;
        if (status === 'fulfilled') {
          return {
            name: result.value.name,
            symbol: result.value.symbol,
            decimals: result.value.decimals,
          };
        } else {
          return {
            name: UNKNOWN_STRING,
            symbol: UNKNOWN_STRING,
            decimals: UNKNOWN_UINT256,
          };
        }
      });
    }

    return { multiTokenInfos, singleTokenInfos };
  }

  async createSingleTokens(
    singleTokenAddresses: string[],
    singleTokenInfos: any,
    @TransactionManager() manager: EntityManager,
  ): Promise<void> {
    const singleTokenBulkParams = singleTokenAddresses.map(
      (address: string, index: number) => {
        const { name, symbol, decimals } = singleTokenInfos[index];

        return {
          network: this.context.network,
          type: TokenType.SINGLE,
          address,
          name,
          symbol,
          decimals: decimals.toString(),
          status: name !== UNKNOWN_STRING && symbol !== UNKNOWN_STRING,
        };
      },
    );

    await this.tokenService.createTokensIfNotExist(
      singleTokenBulkParams,
      manager,
    );
  }

  async createMultiTokens(
    multiTokenAddresses: string[],
    multiTokenInfos: any,
    multiTokenComposed: any,
    invalidSingleTokenAddresses: string[],
    @TransactionManager() manager: EntityManager,
  ): Promise<void> {
    const multiTokenBulkParams = [];
    const multiTokenInSameChunk = [];

    await Promise.all(
      multiTokenAddresses.map(async (address: string, index: number) => {
        const { name, symbol, decimals } = multiTokenInfos[index];

        const { token0, token1 } = multiTokenComposed.find(
          (info: any) => info.pair.toLowerCase() === address.toLowerCase(),
        );

        const hasInvalidComposed = invalidSingleTokenAddresses.some(
          (address: string) => address === token0 || address === token1,
        );
        if (hasInvalidComposed) return;

        const [registeredToken0, registeredToken1] = await Promise.all([
          this.tokenService.findToken(
            { network: this.context.network, address: token0 },
            manager,
          ),
          this.tokenService.findToken(
            { network: this.context.network, address: token1 },
            manager,
          ),
        ]);

        if (isUndefined(registeredToken0) || isUndefined(registeredToken1)) {
          multiTokenInSameChunk.push({
            address,
            name,
            symbol,
            decimals,
            token0,
            token1,
          });
        } else {
          if (registeredToken0.status && registeredToken1.status) {
            multiTokenBulkParams.push({
              network: this.context.network,
              type: TokenType.MULTI,
              address,
              name,
              symbol: getPairTokenSymbol(registeredToken0, registeredToken1),
              decimals: decimals.toString(),
              pair0: registeredToken0,
              pair1: registeredToken1,
              status: name !== UNKNOWN_STRING && symbol !== UNKNOWN_STRING,
            });
          }
        }
      }),
    );

    await this.tokenService.createTokensIfNotExist(
      multiTokenBulkParams,
      manager,
    );

    if (multiTokenInSameChunk.length > 0) {
      const multiTokenInSameChunkBulkParams = [];
      await Promise.all(
        multiTokenInSameChunk.map(
          async ({ address, name, symbol, decimals, token0, token1 }) => {
            const [registeredToken0, registeredToken1] = await Promise.all([
              this.tokenService.findToken(
                { network: this.context.network, address: token0 },
                manager,
              ),
              this.tokenService.findToken(
                { network: this.context.network, address: token1 },
                manager,
              ),
            ]);

            if (registeredToken0.status && registeredToken1.status) {
              multiTokenInSameChunkBulkParams.push({
                network: this.context.network,
                type: TokenType.MULTI,
                address,
                name,
                symbol: getPairTokenSymbol(registeredToken0, registeredToken1),
                decimals: decimals.toString(),
                pair0: registeredToken0,
                pair1: registeredToken1,
                status: name !== UNKNOWN_STRING && symbol !== UNKNOWN_STRING,
              });
            }
          },
        ),
      );

      await this.tokenService.createTokensIfNotExist(
        multiTokenInSameChunkBulkParams,
        manager,
      );
    }
  }

  async getPairsInfo(multiTokens: string[]) {
    return getBatchPairInfos(
      this.context.provider,
      this.context.multiCallAddress,
      multiTokens,
    );
  }

  async doTask(
    multiTokens: string[],
    @TransactionManager() manager: EntityManager,
  ): Promise<void> {
    // { pair: string, token0: string, token1: string }
    const multiTokenComposed = await this.getPairsInfo(multiTokens);

    const { uniqueMultiTokenAddresses, uniqueSingleTokenAddresses } =
      this.grouping(multiTokenComposed);

    const { newMultiTokenAddresses, newSingleTokenAddresses } =
      await this.removeRegisteredTokens(
        uniqueMultiTokenAddresses,
        uniqueSingleTokenAddresses,
      );

    const {
      validMultiTokenAddresses,
      validSingleTokenAddresses,
      invalidSingleTokenAddresses,
    } = await this.removeInvalidTokens(
      newMultiTokenAddresses,
      newSingleTokenAddresses,
    );

    const {
      pureMultiTokenAddresses,
      pureSingleTokenAddresses,
      pureInvalidSingleTokenAddresses,
    } = await this.checkMultiTokenInSinglePosition(
      validMultiTokenAddresses,
      validSingleTokenAddresses,
      invalidSingleTokenAddresses,
    );

    const { multiTokenInfos, singleTokenInfos } = await this.getTokenInfos(
      pureMultiTokenAddresses,
      pureSingleTokenAddresses,
    );

    if (pureSingleTokenAddresses.length > 0)
      await this.createSingleTokens(
        pureSingleTokenAddresses,
        singleTokenInfos,
        manager,
      );

    if (pureMultiTokenAddresses.length > 0)
      await this.createMultiTokens(
        pureMultiTokenAddresses,
        multiTokenInfos,
        multiTokenComposed,
        pureInvalidSingleTokenAddresses,
        manager,
      );
  }

  async run(logger?: SchedulerLoggerDTO): Promise<void> {
    const loggerData: { [key: string]: any } = {
      total: null,
      current: null,
      start: null,
      end: null,
    };

    let queryRunner: QueryRunner | null = null;
    try {
      const [networkPid, schedulerPid] = await Promise.all([
        this.networkPid(),
        this.schedulerPid(),
      ]);

      const sPid = Number(schedulerPid);
      let ePid = Number(networkPid);

      loggerData.total = networkPid.toString();
      loggerData.current = schedulerPid.toString();

      if (isGreaterThanOrEqual(sPid, ePid)) return;

      const chunkSize = 10;

      if (isGreaterThan(sub(ePid, sPid), chunkSize)) {
        ePid = parseInt(add(sPid, chunkSize).toString(), 10);
      }

      loggerData.start = sPid.toString();
      loggerData.end = ePid.toString();

      const pids = fillSequenceNumber(
        parseInt(sub(ePid, sPid).toString(), 10),
        sPid,
      );

      const multiTokens = await this.context.getAMMFactoryInfos(pids);

      queryRunner = await getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.doTask(multiTokens, queryRunner.manager);

      await this.schedulerService.updateScheduler(
        { id: this.id },
        { pid: ePid },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      if (!isNull(queryRunner)) {
        await queryRunner.rollbackTransaction();
      }
      this.errorHandler(e);
    } finally {
      if (!isNull(queryRunner) && !queryRunner?.isReleased) {
        await queryRunner.release();
      }
      if (logger) {
        logger.setData(loggerData);
      }
    }
  }
}
