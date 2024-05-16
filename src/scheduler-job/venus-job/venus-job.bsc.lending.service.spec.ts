import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { VenusJobBSCLendingService } from './venus-job.bsc.lending.service';

describe('VenusJobBSCLendingService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: VenusJobBSCLendingService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<VenusJobBSCLendingService>(VenusJobBSCLendingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('is working', async () => {
      await service.run();
    });
  });
});
