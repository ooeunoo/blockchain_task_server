import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { LoggerDTO } from './logger.dto';
import { RequestLoggerExtend } from './logger.interface';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: RequestLoggerExtend, res: Response, next: () => void): any {
    req.logger = new LoggerDTO(req);
    next();
  }
}
