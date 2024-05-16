import { NestFactory } from '@nestjs/core';
import { AppSchedulerModule } from './app-scheduler/app-scheduler.module';
import { AppSchedulerService } from './app-scheduler/app-scheduler.service';
import { SchedulerLoggerService } from './app-scheduler/scheduler-logger/scheduler-logger.service';

(async () => {
  const app = await NestFactory.createApplicationContext(AppSchedulerModule);

  app.useLogger(app.get<SchedulerLoggerService>(SchedulerLoggerService));

  const scheduler = app.get<AppSchedulerService>(AppSchedulerService);
  scheduler.run();
})();
