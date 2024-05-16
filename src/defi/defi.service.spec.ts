import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { DefiService } from './defi.service';

describe('DefiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: DefiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<DefiService>(DefiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
