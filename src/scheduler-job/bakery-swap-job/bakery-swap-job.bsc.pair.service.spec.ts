import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { BakerySwapBSCPairService } from './bakery-swap-job.bsc.pair.service';

describe('BakerySwapBSCPairService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: BakerySwapBSCPairService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<BakerySwapBSCPairService>(BakerySwapBSCPairService);
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
