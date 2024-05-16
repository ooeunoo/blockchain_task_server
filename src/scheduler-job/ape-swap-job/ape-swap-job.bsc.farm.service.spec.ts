import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { ApeSwapBSCFarmService } from './ape-swap-job.bsc.farm.service';

describe('ApeSwapBSCFarmService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: ApeSwapBSCFarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<ApeSwapBSCFarmService>(ApeSwapBSCFarmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('is working', async () => {
      while (true) {
        await service.run();
      }
    });
  });
});
