import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { Response } from 'express';
import { catchError, tap } from 'rxjs/operators';
import { RequestLoggerExtend } from './logger.interface';
import { LoggerDTO } from './logger.dto';
import { LoggerService } from './logger.service';
import {
  Exception,
  InternalException,
} from '../../common/exceptions/exception.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const req = http.getRequest<RequestLoggerExtend>();
    const res = http.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        if (req?.logger instanceof LoggerDTO) {
          req.logger.setParams(req.params);
          req.logger.setSuccess(Math.floor(res.statusCode / 100) === 2);
          req.logger.stopTimer();
          req.logger.log(this.logger);
        }
      }),
      catchError((e) => {
        return throwError(e instanceof Exception ? e : new InternalException());
      }),
    );
  }
}
