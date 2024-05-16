import { HttpStatus } from '@nestjs/common';
import { ExceptionCode, ExceptionLevel } from './exception.constant';

function getExceptionCode(enumValue) {
  const keys = Object.keys(ExceptionCode).filter(
    (x) => ExceptionCode[x] == enumValue,
  );
  return keys.length > 0 ? keys[0] : null;
}

export class Exception extends Error {
  public readonly message: string;
  public readonly code: string;
  public readonly level: ExceptionLevel;
  public readonly httpCode: HttpStatus;
  public readonly data?: any | any[];

  constructor(
    message: ExceptionCode,
    options?: {
      httpCode?: HttpStatus;
      level?: ExceptionLevel;
      data?: any | any[];
    },
  ) {
    super(message);
    this.message = message;
    this.code = getExceptionCode(message);
    this.httpCode = options?.httpCode || HttpStatus.INTERNAL_SERVER_ERROR;
    this.level = options?.level || ExceptionLevel.Fatal;
    this.data = options?.data;
    Error.captureStackTrace(this);
  }

  get build() {
    return {
      message: this.message,
      code: this.code,
      httpCode: this.httpCode,
      data: this.data,
    };
  }
}

export class InternalException extends Exception {
  constructor() {
    super(ExceptionCode.ERR000, {
      level: ExceptionLevel.Fatal,
      httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}

export class NotFoundAPIException extends Exception {
  constructor() {
    super(ExceptionCode.ERR001, {
      level: ExceptionLevel.Fatal,
      httpCode: HttpStatus.NOT_FOUND,
    });
  }
}

export class ValidationException extends Exception {
  constructor(data: any | any[]) {
    super(ExceptionCode.ERR002, {
      level: ExceptionLevel.Fatal,
      httpCode: HttpStatus.BAD_REQUEST,
      data,
    });
  }
}
