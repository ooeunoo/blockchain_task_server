import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { PancakeSwapBSCNFT4Service } from './pancake-swap-job.bsc.nft4.service';

describe('PancakeSwapBSCNFT4Service', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCNFT4Service;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCNFT4Service>(PancakeSwapBSCNFT4Service);
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
