import { Injectable, ConsoleLogger } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { config } from '../../common/config/config.service';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly rotateLoggerFormat;
  private readonly rotateOptions;

  private readonly rotateLogger: winston.Logger;
  private readonly rotateErrorLogger: winston.Logger;
  private readonly stdoutLogger: winston.Logger;

  constructor() {
    super();

    this.rotateLoggerFormat = format.combine(
      format.label({ label: `${config.projectName}-api` }),
      format.timestamp(),
      format.json(),
    );
    this.rotateOptions = {
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '100m',
      utc: true,
    };

    this.rotateLogger = createLogger({
      level: 'info',
      format: this.rotateLoggerFormat,
      transports: [
        new DailyRotateFile({
          level: 'info',
          filename: `./logs/%DATE%-${config.projectName}-api-info.log`,
          ...this.rotateOptions,
        }),
      ],
    });

    this.rotateErrorLogger = createLogger({
      level: 'error',
      format: this.rotateLoggerFormat,
      transports: [
        new DailyRotateFile({
          level: 'error',
          filename: `./logs/%DATE%-${config.projectName}-api-error.log`,
          ...this.rotateOptions,
        }),
      ],
    });

    this.stdoutLogger = createLogger({
      format: format.simple(),
      transports: [new transports.Console()],
    });
  }

  getFileLogger(isError: boolean): winston.Logger {
    return isError ? this.rotateErrorLogger : this.rotateLogger;
  }

  getConsoleLogger(): winston.Logger {
    return this.stdoutLogger;
  }

  log(message: string, meta?: unknown): void {
    this.getFileLogger(false).info(message, meta);
    this.getConsoleLogger().info(message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.getFileLogger(false).warn(message, meta);
    this.getConsoleLogger().warn(message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.getFileLogger(false).info(message, meta);
    this.getConsoleLogger().info(message, meta);
  }

  verbose(message: string, meta?: unknown): void {
    this.getFileLogger(false).info(message, meta);
    this.getConsoleLogger().info(message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.getFileLogger(true).error(message, meta);
    this.getConsoleLogger().error(message, meta);
  }
}
