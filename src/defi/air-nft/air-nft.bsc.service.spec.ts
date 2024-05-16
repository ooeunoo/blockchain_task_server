import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { AirNftBSCService } from './air-nft.bsc.service';

describe('AirNftBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AirNftBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AirNftBSCService>(AirNftBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNFTInfos', () => {
    it('is working', async () => {
      const result = await service.getNFTInfos([1, 2]);
      console.log(result);
    });
  });

  describe('getWalletNFTs', () => {
    it('is working', async () => {
      const result = await service.getWalletNFTokens(
        '0xFDcBF476B286796706e273F86aC51163DA737FA8',
      );
      console.log(JSON.stringify(result));
    });
  });
});
