import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { BiSwapBSCService } from './bi-swap.bsc.service';

describe('BiSwapBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: BiSwapBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<BiSwapBSCService>(BiSwapBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletFarms', () => {
    it('is working', async () => {
      const result = await service.getWalletFarms(
        '0xFDcBF476B286796706e273F86aC51163DA737FA8',
      );
      console.log(JSON.stringify(result));
    });
  });
});
