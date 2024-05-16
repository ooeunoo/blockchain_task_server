import { Exception } from '../../common/exceptions/exception.service';
import { LoggerService } from './logger.service';
import { RequestLoggerExtend } from './logger.interface';

export class LoggerDTO {
  private readonly DEFAULT_LOG_MESSAGE = 'clientRequest';

  private success: boolean;
  private startTime: string;
  private endTime: string;
  private elapsedTime: string;
  private ip: string;
  private protocol: string;
  private method: string;
  private url: string;
  private params: Record<string, any>;
  private query: Record<string, any>;
  private header: any;
  private body: any;
  private error: any;
  private errorCode: any;
  private errorMessage: any;

  constructor(req: RequestLoggerExtend) {
    this.success = true;
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.elapsedTime = null;
    this.ip = req.ip;
    this.protocol = req.protocol;
    this.url = req.baseUrl;
    this.method = req.method;
    this.params = req.params;
    this.query = req.query;
    this.header = req.headers;
    this.body = req.body;
    this.error = null;
    this.errorCode = null;
    this.errorMessage = null;
  }

  setParams(value: Record<string, any>): void {
    this.params = value;
  }

  setSuccess(value: boolean): void {
    this.success = value;
  }

  setError(e: unknown): void {
    this.setSuccess(false);
    try {
      if (e instanceof Exception) {
        this.error = JSON.stringify(e, LoggerDTO.errorToJSON);
      } else {
        this.error = e;
      }
    } catch (err) {}
  }

  stopTimer(): void {
    this.endTime = new Date().toISOString();
    this.elapsedTime = `${
      new Date(this.endTime).getTime() - new Date(this.startTime).getTime()
    } ms`;
  }

  build(): any {
    const result = {
      success: this.success,
      startTime: this.startTime,
      endTime: this.endTime,
      elapsedTime: this.elapsedTime,
      method: this.method,
      ip: this.ip,
      protocol: this.protocol,
      url: this.url,
      params: this.params,
      query: this.query,
      header: this.header,
      body: this.body,
      error: this.error,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
    };
    return result;
  }

  log(logger: LoggerService): void {
    logger[this.success ? 'log' : 'error'](
      this.DEFAULT_LOG_MESSAGE,
      this.build(),
    );
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
