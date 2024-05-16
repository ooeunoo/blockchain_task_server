import { Provider } from '@ethersproject/providers';
import {
  getConnection,
  EntityManager,
  TransactionManager,
  QueryRunner,
} from 'typeorm';
import { Transaction } from 'ethers';
import { SchedulerJobBase } from '../scheduler-job.base';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { NetworkService } from '../../network/network.service';
import { Network } from '@libs/repository/network/entity';
import { InteractionService } from '../../interaction/interaction.service';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { fillSequenceNumber, flat } from '@libs/helper/array';
import { getBatchCheckCA } from '@libs/helper/batch-contract';
import {
  add,
  isGreaterThan,
  isGreaterThanOrEqual,
  sub,
} from '@libs/helper/bignumber';
import { ZERO_ADDRESS } from '@libs/helper/constant';
import { isNull, isUndefined } from '@libs/helper/type';
import { getBatchBlockInfos } from '@libs/helper/batch-rpc';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

export abstract class InteractionTemplate extends SchedulerJobBase {
  network: Network;
  providers: Provider[];

  chunkSize = 10;

  constructor(
    public readonly id: string,
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly networkService: NetworkService,
    public readonly interactionService: InteractionService,
    public readonly chainId: number,
  ) {
    super(
      id,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
    );
  }

  async onModuleInit(): Promise<void> {
    this.network = await this.networkService.findNetwork({
      chain_id: this.chainId,
    });
    this.providers = this.networkService.providers(this.chainId);
  }

  provider(): Provider {
    return this.networkService.provider(this.chainId);
  }

  multiCallAddress(): string {
    return this.network.multi_call_address;
  }

  async getNetworkBlockNumber() {
    return this.provider().getBlockNumber();
  }

  async getSchedulerBlockNumber() {
    const scheduler = await this.schedulerService.findScheduler({
      id: this.id,
    });

    if (isUndefined(scheduler)) {
      throw new Error('Not found scheduler');
    }

    return scheduler.block_number || 0;
  }

  async updateSchedulerBlockNumber(
    endBlock: number,
    @TransactionManager() manager?: EntityManager,
  ) {
    return this.schedulerService.updateScheduler(
      { id: this.id },
      { block_number: endBlock },
      manager,
    );
  }

  async getBatchBlockWithTransaction(
    sBlock: number,
    eBlock: number,
    withTransaction = true,
  ) {
    const blockNumbers = fillSequenceNumber(
      Number(sub(eBlock, sBlock).toString()),
      sBlock,
    );

    return getBatchBlockInfos(this.provider(), blockNumbers, withTransaction);
  }

  async bulkCreate(
    bulkParams: {
      network: Network;
      from_address: string;
      to_address: string;
    }[],
    @TransactionManager() manager?: EntityManager,
  ) {
    return this.interactionService.createInteractionsIfNotExist(
      bulkParams,
      manager,
    );
  }

  async parseContractInteractionTransaction(transactions: Transaction[]) {
    const toAddresses = transactions.map((transaction: Transaction) => {
      return isNull(transaction.to) ? ZERO_ADDRESS : transaction.to;
    });

    if (toAddresses.length == 0) return [];

    const checkCA = await getBatchCheckCA(
      this.provider(),
      this.multiCallAddress(),
      toAddresses,
    );

    const contractInteractionTransactions = transactions.filter(
      (_transactions: Transaction, index: number) => {
        return checkCA[index];
      },
    );

    return contractInteractionTransactions.map((transaction: Transaction) => {
      return {
        network: this.network,
        from_address: transaction.from,
        to_address: transaction.to,
      };
    });
  }

  async run(logger: SchedulerLoggerDTO): Promise<void> {
    const loggerData: { [key: string]: any } = {};

    const [schedulerBlockNumber, networkBlockNumber] = await Promise.all([
      this.getSchedulerBlockNumber(),
      this.getNetworkBlockNumber(),
    ]);

    const sBlock = Number(schedulerBlockNumber);
    let eBlock = Number(networkBlockNumber);

    if (isGreaterThanOrEqual(sBlock, eBlock)) return;

    // TODO: Change Constants

    if (isGreaterThan(sub(eBlock, sBlock), this.chunkSize)) {
      eBlock = Number(add(sBlock, this.chunkSize));
    }

    loggerData.total = networkBlockNumber.toString();
    loggerData.start = sBlock;
    loggerData.end = eBlock;

    let queryRunner: QueryRunner | null = null;
    try {
      const { data }: { data: any } = await this.getBatchBlockWithTransaction(
        sBlock,
        eBlock,
      );

      const bulkParams = [];
      await Promise.all(
        data.map(async (response) => {
          if (response?.error) return;

          const params = await this.parseContractInteractionTransaction(
            response.result.transactions,
          );

          if (params.length > 0) bulkParams.push(flat(params));
        }),
      );

      queryRunner = await getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.bulkCreate(flat(bulkParams), queryRunner.manager);
      await this.updateSchedulerBlockNumber(eBlock, queryRunner.manager);

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
