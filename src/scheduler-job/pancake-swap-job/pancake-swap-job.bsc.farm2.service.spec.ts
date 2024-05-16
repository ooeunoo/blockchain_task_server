import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { PancakeSwapJobBSCFarm2Service } from './pancake-swap-job.bsc.farm2.service';

describe('PancakeSwapJobBSCFarm2Service', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapJobBSCFarm2Service;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapJobBSCFarm2Service>(
      PancakeSwapJobBSCFarm2Service,
    );
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
