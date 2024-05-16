import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { NetworkService } from '../network/network.service';

describe('TokenService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: WalletService;
  let networkService: NetworkService;
  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletTokenBalance', () => {
    it('is working', async () => {
      const result = await service.getWalletTokenBalances(
        '0xFDcBF476B286796706e273F86aC51163DA737FA8',
      );
      console.log(result);
    });
  });
});
