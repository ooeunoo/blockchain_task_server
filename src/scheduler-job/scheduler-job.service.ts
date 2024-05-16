import { Injectable } from '@nestjs/common';
import { SchedulerService } from '../scheduler/scheduler.service';
import { SingletonSchedulerRegistry } from './scheduler-job.registry';

@Injectable()
export class SchedulerJobService {
  constructor(
    private readonly singleTokenSchedulerRegistry: SingletonSchedulerRegistry,
    private readonly schedulerService: SchedulerService,
  ) {}

  async getAllSchedulers() {
    return this.schedulerService.findSchedulers({ status: true });
  }

  async start() {
    // TODO: Protocol Join & status true
    const schedulers = await this.getAllSchedulers();

    // all scheduler process initialize
    await this.schedulerService.updateScheduler({}, { process: false });

    schedulers.forEach(async ({ id }) => {
      const isExist = this.singleTokenSchedulerRegistry.isExist(id);
      // TODO: LOG
      if (!isExist) {
        await this.schedulerService.updateScheduler({ id }, { status: false });
      } else {
        const job = this.singleTokenSchedulerRegistry.getScheduler(id);
        await job.start();
      }
    });
  }
}
