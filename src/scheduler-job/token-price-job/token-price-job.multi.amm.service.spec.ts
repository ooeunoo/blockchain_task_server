import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { TokenPriceMultiAMMService } from './token-price-job.multi.amm.service';

describe('TokenPriceMultiAMMService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: TokenPriceMultiAMMService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<TokenPriceMultiAMMService>(TokenPriceMultiAMMService);
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
      console.log('finisehd');
    });
  });
});
