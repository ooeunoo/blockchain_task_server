import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { AbiModule } from '../abi/abi.module';
import { DefiModule } from '../defi/defi.module';
import { FarmModule } from '../farm/farm.module';
import { LendingModule } from '../lending/lending.module';
import { NetworkModule } from '../network/network.module';
import { NFTokenModule } from '../nf-token/nf-token.module';
import { ProtocolModule } from '../protocol/protocol.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { TokenModule } from '../token/token.module';
import { MysqlConfigService } from '../common/mysql/mysql-config.service';
import { InteractionModule } from '../interaction/interaction.module';

export class TestModule {
  module: TestingModule;
  app: INestApplication;

  async createTestModule(): Promise<INestApplication> {
    this.module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
        AppModule,
        AbiModule,
        NetworkModule,
        ProtocolModule,
        FarmModule,
        LendingModule,
        NFTokenModule,
        SchedulerModule,
        TokenModule,
        InteractionModule,
        DefiModule,
      ],
    }).compile();

    this.app = this.module.createNestApplication();

    await this.app.init();
    return this.app;
  }
}
