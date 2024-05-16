import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { ApeSwapBSCService } from './ape-swap.bsc.service';

describe('ApeSwapBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: ApeSwapBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<ApeSwapBSCService>(ApeSwapBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('property', () => {
    it('token', () => {
      console.log(service.token);
    });
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
