import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { KlaySwapKLAYTNPairService } from './klay-swap-job.klaytn.pair.service';

describe('KlaySwapKLAYTNPairService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: KlaySwapKLAYTNPairService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<KlaySwapKLAYTNPairService>(KlaySwapKLAYTNPairService);
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
