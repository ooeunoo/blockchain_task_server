import { Injectable, ConsoleLogger } from '@nestjs/common';
import { createLogger, format } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { config } from '../../common/config/config.service';
import { SchedulerLoggerLevel } from './scheduler-logger.constant';

const alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: '[LOGGER]',
  }),
  winston.format.timestamp({
    format: 'YY-MM-DD HH:MM:SS',
  }),
  winston.format.printf((info) => {
    const base = `${info.label}  ${info.timestamp} (${info.elapsedTime})  ${info.level} : ${info.id}`;

    if (info.logLevel === SchedulerLoggerLevel.ERROR) {
      return `${base} : ${info.errorData}`;
    }

    return `${base} : ${info.message}`;
  }),
);

@Injectable()
export class SchedulerLoggerService extends ConsoleLogger {
  private readonly rotateLoggerFormat;
  private readonly rotateOptions;

  private readonly rotateLogger: winston.Logger;
  private readonly rotateErrorLogger: winston.Logger;
  private readonly rotateWarnLogger: winston.Logger;
  private readonly stdoutLogger: winston.Logger;

  constructor() {
    super();

    this.rotateLoggerFormat = format.combine(
      format.label({ label: `${config.projectName}-scheduler` }),
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
          filename: `./logs/%DATE%-${config.projectName}-scheduler-info.log`,
          ...this.rotateOptions,
        }),
      ],
    });

    this.rotateWarnLogger = createLogger({
      level: 'warn',
      format: this.rotateLoggerFormat,
      transports: [
        new DailyRotateFile({
          level: 'warn',
          filename: `./logs/%DATE%-${config.projectName}-scheduler-warn.log`,
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
          filename: `./logs/%DATE%-${config.projectName}-scheduler-error.log`,
          ...this.rotateOptions,
        }),
      ],
    });

    this.stdoutLogger = createLogger({
      format: format.simple(),
      transports: [
        new winston.transports.Console({
          format: alignColorsAndTime,
        }),
      ],
      // transports: [new transports.Console()],
    });
  }

  getFileLogger(level: SchedulerLoggerLevel): winston.Logger {
    switch (level) {
      case SchedulerLoggerLevel.SUCCESS:
        return this.rotateLogger;
      case SchedulerLoggerLevel.WARN:
        return this.rotateWarnLogger;
      case SchedulerLoggerLevel.ERROR:
        return this.rotateErrorLogger;
    }
  }

  getConsoleLogger(): winston.Logger {
    return this.stdoutLogger;
  }

  log(message: string, meta?: unknown): void {
    this.getFileLogger(SchedulerLoggerLevel.SUCCESS).info(message, meta);
    this.getConsoleLogger().info(message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.getFileLogger(SchedulerLoggerLevel.WARN).warn(message, meta);
    this.getConsoleLogger().warn(message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.getFileLogger(SchedulerLoggerLevel.ERROR).error(message, meta);
    this.getConsoleLogger().error(message, meta);
  }
}
