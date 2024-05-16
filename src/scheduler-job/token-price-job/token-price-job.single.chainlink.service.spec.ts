import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { TokenPriceSingleChainLinkService } from './token-price-job.single.chainlink.service';

describe('TokenPriceSingleChainLinkService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: TokenPriceSingleChainLinkService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<TokenPriceSingleChainLinkService>(
      TokenPriceSingleChainLinkService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokens', () => {
    it('is working', async () => {
      const result = await service.getTokens();
      console.log(result);
    });
  });

  describe('run', () => {
    it('is working', async () => {
      await service.run();
    });
  });
});
