import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { PancakeSwapBSCPairService } from './pancake-swap-job.bsc.pair.service';

describe('PancakeSwapBSCPairService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCPairService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCPairService>(PancakeSwapBSCPairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('is working', async () => {
      while (true) {
        await service.run();
        console.log('each finished');
      }
    });
  });
});
