import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  Exception,
  InternalException,
  NotFoundAPIException,
} from '../../common/exceptions/exception.service';
import { LoggerService } from '../logger/logger.service';
import { RequestLoggerExtend } from '../logger/logger.interface';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<any> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestLoggerExtend>();

    let targetException;

    if (exception instanceof NotFoundException) {
      targetException = new NotFoundAPIException();
    } else if (exception instanceof Exception) {
      targetException = exception;
    } else {
      targetException = new InternalException();
    }

    const build = targetException.build;
    const status = build.httpCode;
    const sendData: any = {
      message: build.message,
      errorCode: build.code,
    };

    if (build.data) {
      sendData.data = build.data;
    }

    // Logger
    if (req.logger) {
      req.logger.setError(exception);
      req.logger.stopTimer();
      req.logger.log(this.logger);
    }

    return res.status(status).json(sendData);
  }
}
