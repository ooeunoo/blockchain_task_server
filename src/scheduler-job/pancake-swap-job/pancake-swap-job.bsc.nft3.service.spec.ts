import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { PancakeSwapBSCNFT3Service } from './pancake-swap-job.bsc.nft3.service';

describe('PancakeSwapBSCNFT3Service', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCNFT3Service;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCNFT3Service>(PancakeSwapBSCNFT3Service);
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
