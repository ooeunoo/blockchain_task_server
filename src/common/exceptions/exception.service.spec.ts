import { HttpException } from '@nestjs/common';
import { ExceptionCode } from './exception.constant';
import { Exception } from './exception.service';

describe('Exception', () => {
  it('throw new Exception', () => {
    const code = ExceptionCode.ERR001;
    try {
      throw new Exception(code);
    } catch (e) {
      console.log(e instanceof HttpException);

      console.log(e instanceof Exception);
      console.log(e.build);
    }
  });
});
