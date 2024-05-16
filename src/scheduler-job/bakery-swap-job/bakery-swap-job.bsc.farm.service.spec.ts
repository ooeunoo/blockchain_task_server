import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { BakerySwapBSCFarmService } from './bakery-swap-job.bsc.farm.service';

describe('BakerySwapBSCFarmService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: BakerySwapBSCFarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<BakerySwapBSCFarmService>(BakerySwapBSCFarmService);
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
