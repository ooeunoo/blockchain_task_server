import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { SushiSwapJobBSCPairService } from './sushi-swap-job.bsc.pair.service';

describe('SushiSwapJobBSCPairService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: SushiSwapJobBSCPairService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<SushiSwapJobBSCPairService>(SushiSwapJobBSCPairService);
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
