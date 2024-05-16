import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class SingletonSchedulerRegistry {
  constructor(public readonly schedulerRegistry: SchedulerRegistry) {}

  getScheduler(id: string): CronJob {
    return this.schedulerRegistry.getCronJob(id);
  }

  addScheduler(id: string, job: CronJob): void {
    this.schedulerRegistry.addCronJob(id, job);
  }

  deleteScheduler(id: string): void {
    return this.schedulerRegistry.deleteCronJob(id);
  }

  isExist(id: string): boolean {
    return this.schedulerRegistry.doesExists('cron', id);
  }
}
