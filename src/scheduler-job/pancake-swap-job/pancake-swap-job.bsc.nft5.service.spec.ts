import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { PancakeSwapBSCNFT5Service } from './pancake-swap-job.bsc.nft5.service';

describe('PancakeSwapBSCNFT5Service', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCNFT5Service;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCNFT5Service>(PancakeSwapBSCNFT5Service);
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
