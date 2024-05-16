import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { FarmService } from './farm.service';
describe('FarmService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: FarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<FarmService>(FarmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findFarm', () => {
    it('is working', async () => {
      const result = await service.findFarm({
        protocol: {
          id: 3,
        },
      });
      console.log(result);
    });
  });
});
