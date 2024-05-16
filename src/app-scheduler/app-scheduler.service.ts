import { Injectable } from '@nestjs/common';
import { SchedulerJobService } from '../scheduler-job/scheduler-job.service';

@Injectable()
export class AppSchedulerService {
  constructor(private schedulerJobService: SchedulerJobService) {}

  async run() {
    await this.schedulerJobService.start();
  }
}
