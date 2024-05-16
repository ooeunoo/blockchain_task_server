import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../app/logger/logger.module';
import { MysqlConfigService } from '../common/mysql/mysql-config.service';
import { SchedulerJobModule } from '../scheduler-job/scheduler-job.module';

export class TestModule {
  module: TestingModule;
  app: INestApplication;

  async createTestModule(): Promise<INestApplication> {
    this.module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
        ScheduleModule.forRoot(),
        SchedulerJobModule,
        LoggerModule,
      ],
    }).compile();

    this.app = this.module.createNestApplication();

    await this.app.init();
    return this.app;
  }
}
