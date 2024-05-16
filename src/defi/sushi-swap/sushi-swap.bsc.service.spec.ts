import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { SushiSwapBSCService } from './sushi-swap.bsc.service';

describe('SushiSwapBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: SushiSwapBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<SushiSwapBSCService>(SushiSwapBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLendingMarkets', () => {
    it('is working', async () => {
      const result = await service.getLendingMarkets();
      console.log(result);
    });
  });
});
