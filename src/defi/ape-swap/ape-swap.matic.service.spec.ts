import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { ApeSwapMATICService } from './ape-swap.matic.service';

describe('ApeSwapMATICService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: ApeSwapMATICService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<ApeSwapMATICService>(ApeSwapMATICService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
