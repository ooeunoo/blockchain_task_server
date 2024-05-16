import { TestModule } from '../app/app.test.module';
import { ConsoleLogger, INestApplication } from '@nestjs/common';
import { SwapService } from './swap.service';
import { TokenService } from '../token/token.service';
import { NetworkService } from '../network/network.service';

describe('SwapService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: SwapService;
  let networkService: NetworkService;
  let tokenService: TokenService;
  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<SwapService>(SwapService);
    networkService = app.get<NetworkService>(NetworkService);
    tokenService = app.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletTokenBalance', () => {
    it('is working', async () => {
      const network = await networkService.findNetwork({ chain_id: 56 });
      const network1 = await networkService.findNetwork({ chain_id: 56 });

      const provider = networkService.provider(56);

      const WBNB = await tokenService.findToken({ symbol: 'CAKE', network });
      const CAKE = await tokenService.findToken({
        symbol: 'WETH',
        network: network1,
      });
      const result = await service.search(
        56,
        WBNB,
        CAKE,
        '1000000000000000000',
      );
      console.log(result);
    });
  });
});
