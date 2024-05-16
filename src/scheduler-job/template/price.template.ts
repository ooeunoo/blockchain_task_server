import { SchedulerJobBase } from '../scheduler-job.base';
import { TokenService } from '../../token/token.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { NetworkService } from '../../network/network.service';
import { getConnection } from 'typeorm';
import { Token } from '@libs/repository/token/entity';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { isGreaterThan } from '@libs/helper/bignumber';
import { ZERO } from '@libs/helper/constant';
import { groupBy, toSplitWithChunkSize } from '../../../libs/helper/src/array';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

export abstract class PriceTemplate extends SchedulerJobBase {
  chunkSize = 100;
  abstract getTokens(): Promise<Token[]>;
  abstract crawlTokenSupplyAndPrice(
    chainId: number,
    targetTokens: Token[],
  ): Promise<{ id; values: { price_value: string; total_supply: string } }[]>;

  constructor(
    public readonly id: string,
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly networkService: NetworkService,
  ) {
    super(
      id,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
    );
  }

  onModuleInit(): Promise<void> {
    return;
  }

  async bulkUpdate(
    bulkParams: {
      id: number;
      values: { price_value: string; total_supply: string };
    }[],
  ) {
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //TODO: Change
      const max = '100000000000000000000000000000000000';

      await Promise.all(
        bulkParams.map(
          async ({ id, values: { price_value, total_supply } }) => {
            await this.tokenService.updateToken(
              { id },
              {
                price_value:
                  isGreaterThan(price_value, max) ||
                  !isFinite(Number(price_value))
                    ? ZERO.toString()
                    : price_value,
                total_supply:
                  isGreaterThan(total_supply, max) ||
                  !isFinite(Number(total_supply))
                    ? ZERO.toString()
                    : total_supply,
              },
              queryRunner.manager,
            );
          },
        ),
      );
      await queryRunner.commitTransaction();
    } catch (e) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.errorHandler(e);
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  async refresh(tokens: Token[]): Promise<void> {
    const tokenGroupByChainId = groupBy(tokens, 'network.chain_id');

    for await (const chainId of Object.keys(tokenGroupByChainId)) {
      const targetChainId = Number(chainId);

      const totalChainTokens = tokenGroupByChainId[targetChainId];

      const chunkChainTokens = toSplitWithChunkSize(
        totalChainTokens,
        this.chunkSize,
      );

      for await (const targetTokens of chunkChainTokens) {
        const updateParams = await this.crawlTokenSupplyAndPrice(
          targetChainId,
          targetTokens,
        );
        await this.bulkUpdate(updateParams);
      }
    }
  }

  async run(logger?: SchedulerLoggerDTO): Promise<void> {
    const loggerData: { [key: string]: any } = {
      total: null,
    };

    try {
      const tokens = await this.getTokens();
      loggerData.total = tokens.length;

      await this.refresh(tokens);
    } catch (e) {
      console.log(e);
      this.errorHandler(e);
    } finally {
      if (logger) {
        logger.setData(loggerData);
      }
    }
  }
}
