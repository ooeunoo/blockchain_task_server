import { Request } from 'express';
import { LoggerDTO } from './logger.dto';

export interface RequestLoggerExtend extends Request {
  logger: LoggerDTO;
}
