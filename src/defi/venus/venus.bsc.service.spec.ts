import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { VenusBSCService } from './venus.bsc.service';

describe('VenusBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: VenusBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<VenusBSCService>(VenusBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletLendings', () => {
    it('is working', async () => {
      const result = await service.getWalletLendings(
        '0xFDcBF476B286796706e273F86aC51163DA737FA8',
      );
    });
  });
});
