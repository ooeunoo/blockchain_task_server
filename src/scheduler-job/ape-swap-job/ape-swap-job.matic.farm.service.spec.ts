import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { ApeSwapMATICFarmJobService } from './ape-swap-job.matic.farm.service';

describe('ApeSwapMATICFarmJobService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: ApeSwapMATICFarmJobService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<ApeSwapMATICFarmJobService>(ApeSwapMATICFarmJobService);
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
