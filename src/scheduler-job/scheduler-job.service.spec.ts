import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerJobService } from './scheduler-job.service';

describe('SchedulerJobService', () => {
  let service: SchedulerJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulerJobService],
    }).compile();

    service = module.get<SchedulerJobService>(SchedulerJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
