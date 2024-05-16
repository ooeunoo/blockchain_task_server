import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { WaultSwapBSCPairService } from './wault-swap-job.bsc.pair.service';

describe('WaultSwapBSCPairService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: WaultSwapBSCPairService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<WaultSwapBSCPairService>(WaultSwapBSCPairService);
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
