import { ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { flat } from '@libs/helper/array';
import { AppModule } from './app/app.module';
import { LoggerService } from './app/logger/logger.service';
import { SwaggerConfigService } from './app/swagger/swagger-config.service';
import { ValidationException } from './common/exceptions/exception.service';

(async () => {
  try {
    const app = await NestFactory.create(AppModule);

    app.useLogger(app.get<LoggerService>(LoggerService));
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors: ValidationError[]) => {
          const data = errors.map(({ constraints }) => {
            return Object.values(constraints);
          });
          return new ValidationException(flat(data));
        },
      }),
    );
    app.enableCors();

    new SwaggerConfigService().create(app);
    await app.listen(3000);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
})();
