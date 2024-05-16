import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { PancakeSwapBSCNFTService } from './pancake-swap-job.bsc.nft.service';

describe('PancakeSwapBSCNFTService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCNFTService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCNFTService>(PancakeSwapBSCNFTService);
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
