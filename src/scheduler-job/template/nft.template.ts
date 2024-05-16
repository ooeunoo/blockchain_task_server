import { BigNumber } from '@ethersproject/bignumber';
import axios from 'axios';
import { SchedulerJobBase } from '../scheduler-job.base';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { NFTokenService } from '../../nf-token/nf-token.service';
import {
  EntityManager,
  getConnection,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { fillSequenceNumber } from '@libs/helper/array';
import {
  add,
  isGreaterThan,
  isGreaterThanOrEqual,
  sub,
} from '@libs/helper/bignumber';
import { isNull, isUndefined } from '@libs/helper/type';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

export abstract class NFTTemplate extends SchedulerJobBase {
  constructor(
    public readonly id: string,
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly nfTokenService: NFTokenService,
    public readonly context,
  ) {
    super(
      id,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
    );
  }

  abstract imageOrAnimationPath;

  abstract networkPid(): Promise<BigNumber>;
  // main logic crawl nf token
  abstract crawlNFTokens(pids: number[]): Promise<any>;

  async schedulerPid(): Promise<number> {
    const scheduler = await this.schedulerService.findScheduler({
      id: this.id,
    });

    if (isUndefined(scheduler)) {
      throw new Error('Not found scheduler');
    }

    return scheduler.pid || 0;
  }

  async updateSchedulerPid(
    endPid: number,
    @TransactionManager() manager?: EntityManager,
  ) {
    return this.schedulerService.updateScheduler(
      { id: this.id },
      { pid: endPid },
      manager,
    );
  }

  async run(logger?: SchedulerLoggerDTO) {
    const loggerData: { [key: string]: any } = {
      total: '',
      worked: [],
    };

    let queryRunner: QueryRunner | null = null;
    try {
      const [networkPid, schedulerPid] = await Promise.all([
        this.networkPid(),
        this.schedulerPid(),
      ]);

      loggerData.total = networkPid.toString();

      const sPid = Number(schedulerPid);
      let ePid = Number(networkPid);

      if (isGreaterThanOrEqual(sPid, ePid)) return;

      const chunkSize = 10;

      if (isGreaterThan(sub(ePid, sPid), chunkSize)) {
        ePid = Number(add(sPid, chunkSize));
      }

      const pids = fillSequenceNumber(Number(sub(ePid, sPid)), sPid);
      loggerData.worked = pids;

      const crawledNFTokens = await this.crawlNFTokens(pids);

      queryRunner = await getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.nfTokenService.createNFTokens(
        crawledNFTokens,
        queryRunner.manager,
      );
      await this.updateSchedulerPid(ePid);

      await queryRunner.commitTransaction();
    } catch (e) {
      if (!isNull(queryRunner)) {
        await queryRunner.rollbackTransaction();
      }
      this.errorHandler(e);
    } finally {
      if (!isNull(queryRunner) && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      if (logger) {
        logger.setData(loggerData);
      }
    }
  }
}
