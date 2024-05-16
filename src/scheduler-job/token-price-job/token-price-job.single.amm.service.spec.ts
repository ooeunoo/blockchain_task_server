import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { TokenPriceSingleAMMService } from './token-price-job.single.amm.service';

describe('TokenPriceSingleAMMService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: TokenPriceSingleAMMService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<TokenPriceSingleAMMService>(TokenPriceSingleAMMService);
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
