import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { BakerySwapBSCService } from './bakery-swap.bsc.service';

describe('BakerySwapBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: BakerySwapBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<BakerySwapBSCService>(BakerySwapBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFarmInfos', () => {
    it('is working', async () => {
      const result = await service.getFarmInfos([1, 2]);
      console.log(result);
    });
  });
});
