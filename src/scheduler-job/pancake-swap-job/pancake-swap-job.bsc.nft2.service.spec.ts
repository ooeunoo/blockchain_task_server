import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { PancakeSwapBSCNFT2Service } from './pancake-swap-job.bsc.nft2.service';

describe('PancakeSwapBSCNFT2Service', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCNFT2Service;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCNFT2Service>(PancakeSwapBSCNFT2Service);
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
