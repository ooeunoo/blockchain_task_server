import {
  Module,
  CacheModule,
  CacheInterceptor,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MysqlConfigService } from '../common/mysql/mysql-config.service';

import { LoggerModule } from './logger/logger.module';
import { NetworkModule } from '../network/network.module';
import { AbiModule } from '../abi/abi.module';
import { FarmModule } from '../farm/farm.module';
import { InteractionModule } from '../interaction/interaction.module';
import { NFTokenModule } from '../nf-token/nf-token.module';
import { ProtocolModule } from '../protocol/protocol.module';
import { TokenModule } from '../token/token.module';
import { WalletModule } from '../wallet/wallet.module';
import { SwapModule } from '../swap/swap.module';

import { AllExceptionFilter } from './filter/all-exception.filter';
import { LoggingInterceptor } from './logger/logging.interceptor';
import { LoggerMiddleware } from './logger/logger.middleware';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
    LoggerModule,
    NetworkModule,
    AbiModule,
    FarmModule,
    InteractionModule,
    NFTokenModule,
    ProtocolModule,
    TokenModule,
    WalletModule,
    SwapModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },

    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
