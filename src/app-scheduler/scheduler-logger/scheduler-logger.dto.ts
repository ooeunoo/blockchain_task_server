import { isNull } from '../../../libs/helper/src/type';
import { Exception } from '../../common/exceptions/exception.service';
import { SchedulerLoggerLevel } from './scheduler-logger.constant';
import { SchedulerLoggerService } from './scheduler-logger.service';

export class SchedulerLoggerDTO {
  private id: string;
  private logLevel: SchedulerLoggerLevel;
  private startTime: string;
  private endTime: string;
  private elapsedTime: string;
  private message: string;
  private data: any | any[];
  private error: any;
  private errorCode: any;
  private errorMessage: any;
  private errorData: any;

  constructor(id: string) {
    this.id = id;
    this.logLevel = SchedulerLoggerLevel.SUCCESS;
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.elapsedTime = null;
    this.message = null;
    this.data = null;
    this.error = null;
    this.errorCode = null;
    this.errorMessage = null;
    this.errorData = null;
  }

  setLoggerLevel(value: SchedulerLoggerLevel): void {
    this.logLevel = value;
  }

  setMessage(value: string): void {
    this.message = value;
  }

  setError(e: unknown): void {
    try {
      if (e instanceof Exception) {
        this.error = JSON.stringify(e, SchedulerLoggerDTO.errorToJSON);
        this.errorCode = e.code;
        this.errorMessage = e.message;
        this.errorData = e.data;
        if (isNull(this.message)) {
          this.message = this.errorMessage;
        }
      } else {
        this.error = e;
      }
    } catch (err) {}
  }

  setData(data: any | any[]): void {
    this.data = data;
  }

  stopTimer(): void {
    this.endTime = new Date().toISOString();
    this.elapsedTime = `${
      new Date(this.endTime).getTime() - new Date(this.startTime).getTime()
    } ms`;
  }

  build(): any {
    const result = {
      id: this.id,
      logLevel: this.logLevel,
      startTime: this.startTime,
      endTime: this.endTime,
      elapsedTime: this.elapsedTime,
      message: this.message,
      data: this.data,
      error: this.error,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      errorData: this.errorData,
    };
    return result;
  }

  log(logger: SchedulerLoggerService): void {
    const logLevel = this.logLevel;

    let logType = 'log';
    switch (logLevel) {
      case SchedulerLoggerLevel.SUCCESS:
        break;
      case SchedulerLoggerLevel.WARN:
        logType = 'warn';
        break;
      case SchedulerLoggerLevel.ERROR:
        logType = 'error';
        break;

      default:
        break;
    }

    logger[logType]('scheduler', this.build());
  }

  static errorToJSON(key, value) {
    if (value instanceof Error) {
      const retVal = {};
      Object.getOwnPropertyNames(value).forEach((k) => {
        retVal[k] = value[k];
      });
      return retVal;
    }
    return value;
  }
}
