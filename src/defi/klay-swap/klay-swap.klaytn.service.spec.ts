import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { KlaySwapKLAYTNService } from './klay-swap.klaytn.service';

describe('KlaySwapKLAYTNService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: KlaySwapKLAYTNService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<KlaySwapKLAYTNService>(KlaySwapKLAYTNService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAMMFactoryInfos', () => {
    it('is working', async () => {
      const result = await service.getAMMFactoryInfos([1, 2]);
      console.log(result);
    });
  });
});
