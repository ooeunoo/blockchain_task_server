import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { PancakeSwapBSCFarmService } from './pancake-swap-job.bsc.farm.service';

describe('PancakeSwapBSCFarmService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCFarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCFarmService>(PancakeSwapBSCFarmService);
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
