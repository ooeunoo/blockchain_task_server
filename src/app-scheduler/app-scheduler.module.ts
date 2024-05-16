import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSchedulerService } from './app-scheduler.service';
import { MysqlConfigService } from '../common/mysql/mysql-config.service';
import { SchedulerJobModule } from '../scheduler-job/scheduler-job.module';
import { SchedulerLoggerModule } from './scheduler-logger/scheduler-logger.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
    ScheduleModule.forRoot(),
    SchedulerJobModule,
    SchedulerLoggerModule,
  ],
  providers: [AppSchedulerService],
  exports: [AppSchedulerService],
})
export class AppSchedulerModule {}
