import { OnModuleInit } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { UpdateResult } from 'typeorm';
import { CronJob, CronTime } from 'cron';
import { SchedulerService } from '../scheduler/scheduler.service';
import { SingletonSchedulerRegistry } from './scheduler-job.registry';
import { Scheduler } from '@libs/repository/scheduler/entity';
import { isCronString, isUndefined } from '@libs/helper/type';
import { SchedulerLoggerService } from '../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../app-scheduler/scheduler-logger/scheduler-logger.dto';
import { Exception } from '../common/exceptions/exception.service';
import {
  ExceptionCode,
  ExceptionLevel,
} from '../common/exceptions/exception.constant';
import { SchedulerLoggerLevel } from '../app-scheduler/scheduler-logger/scheduler-logger.constant';

export abstract class SchedulerJobBase implements OnModuleInit {
  private job: CronJob;
  private cron: string = CronExpression.EVERY_SECOND;

  abstract onModuleInit(): Promise<void>;
  abstract run(logger?: SchedulerLoggerDTO): Promise<void>;

  constructor(
    public readonly id: string,
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
  ) {
    this.job = new CronJob(this.cron, async () => await this.processWork());
    this.singletonSchedulerRegistry.addScheduler(this.id, this.job);
  }

  /**
   * Process main when execute cronjob 'start'
   * @returns void
   */
  async processWork(): Promise<void> {
    const logger = new SchedulerLoggerDTO(this.id);

    try {
      const doJob = await this.checkState(logger);

      if (!doJob) return;

      await this.updateProcessing(true);
      await this.run(logger);
      await this.updateProcessing(false);
      logger.setMessage('success');
    } catch (e: any) {
      let targeException: Exception;
      if (e instanceof Exception) {
        targeException = e;
      } else {
        this.errorHandler(e);
      }

      logger.setError(targeException);

      if (targeException.level === ExceptionLevel.Fatal) {
        logger.setLoggerLevel(SchedulerLoggerLevel.ERROR);

        this.singletonSchedulerRegistry.deleteScheduler(this.id);
        await this.updateStatus(false);
        await this.updateError(true);
      } else {
        logger.setLoggerLevel(SchedulerLoggerLevel.WARN);

        await this.updateStatus(true);
        await this.updateProcessing(false);
      }
    } finally {
      logger.stopTimer();
      logger.log(this.schedulerLoggerService);
    }
  }

  /**
   * check scheduler state
   * @returns void
   */
  async checkState(logger: SchedulerLoggerDTO): Promise<boolean> {
    // Check State
    const scheduler = await this.getScheduler();

    // Not register database
    if (isUndefined(scheduler)) {
      this.singletonSchedulerRegistry.deleteScheduler(this.id);
      logger.setMessage('Not found scheduler');
      logger.setLoggerLevel(SchedulerLoggerLevel.WARN);
      return false;
    }

    // processing work
    if (scheduler.process) {
      logger.setMessage('already processing');
      logger.setLoggerLevel(SchedulerLoggerLevel.WARN);
      return false;
    }

    // changed cron string
    if (this.cron !== CronExpression[scheduler.cron]) {
      if (isCronString(CronExpression[scheduler.cron])) {
        logger.setMessage(
          `change cron (${this.cron} => ${CronExpression[scheduler.cron]})`,
        );

        this.cron = CronExpression[scheduler.cron];
        this.job.setTime(new CronTime(this.cron));
        this.job.start();
      } else {
        logger.setMessage('Invalid cron string');
      }
      return false;
    }

    return true;
  }

  /**
   * 등록된 스케줄러 조회
   * @returns scheduler entity
   */
  async getScheduler(): Promise<Scheduler> {
    return this.schedulerService.findScheduler({ id: this.id });
  }

  /**
   * 작업 여부 업데이트
   * @param process true/false (작업 중이면 true, 미작업 중이면 false)
   * @returns update result
   */
  async updateProcessing(process: boolean): Promise<UpdateResult> {
    return this.schedulerService.updateScheduler({ id: this.id }, { process });
  }

  /**
   * 상태 업데이트
   * @param status true/false (상태)
   * @returns update result
   */
  async updateStatus(status: boolean): Promise<UpdateResult> {
    return this.schedulerService.updateScheduler({ id: this.id }, { status });
  }

  /**
   * 에러 업데이트
   * @param error true/false (에러 발생 시 true)
   * @param errorMsg 발생된 에러 메시지
   * @returns update result
   */
  async updateError(error: boolean): Promise<UpdateResult> {
    return this.schedulerService.updateScheduler({ id: this.id }, { error });
  }

  /**
   * 발생 가능한 모든 에러 핸들링
   * @param e 발생 에러
   * @returns exception
   */
  protected errorHandler(e: Error): Exception {
    // missing response
    if (e.message?.match(ExceptionCode.ERR1002)) {
      throw new Exception(ExceptionCode.ERR1002, {
        level: ExceptionLevel.Normal,
        data: e,
      });
    }

    // ETIMEDOUT
    if (e.message?.match(ExceptionCode.ERR1003)) {
      throw new Exception(ExceptionCode.ERR1003, {
        level: ExceptionLevel.Normal,
        data: e,
      });
    }

    // could not detect network
    if (e.message?.match(ExceptionCode.ERR1004)) {
      throw new Exception(ExceptionCode.ERR004, {
        level: ExceptionLevel.Normal,
        data: e,
      });
    }

    // Expected rpc error
    if (e.message?.match(ExceptionCode.ERR1005)) {
      throw new Exception(ExceptionCode.ERR1005, {
        level: ExceptionLevel.Normal,
        data: e,
      });
    }

    // Too Many Requests
    if (e.message?.match(ExceptionCode.ERR1009)) {
      throw new Exception(ExceptionCode.ERR1009, {
        level: ExceptionLevel.Normal,
        data: e,
      });
    }

    // processing response error
    if (e.message?.match(ExceptionCode.ERR1010)) {
      throw new Exception(ExceptionCode.ERR1010, {
        level: ExceptionLevel.Normal,
        data: e,
      });
    }

    // Too many connections
    if (e.message?.match(ExceptionCode.ERR1008)) {
      throw new Exception(ExceptionCode.ERR1008, {
        level: ExceptionLevel.Fatal,
        data: e,
      });
    }

    // missing revert data in call exception
    if (e.message?.match(ExceptionCode.ERR1007)) {
      throw new Exception(ExceptionCode.ERR1007, {
        level: ExceptionLevel.Fatal,
        data: e,
      });
    }

    // unknown exception
    throw new Exception(ExceptionCode.ERR1001, {
      level: ExceptionLevel.Fatal,
      data: e,
    });
  }
}
