import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { AirNFTBSCNFTService } from './air-nft-job.bsc.nft.service';

describe('AirNFTBSCNFTService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AirNFTBSCNFTService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AirNFTBSCNFTService>(AirNFTBSCNFTService);
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
