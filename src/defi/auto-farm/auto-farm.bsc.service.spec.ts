import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { AutoFarmBSCService } from './auto-farm.bsc.service';

describe('AutoFarmBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AutoFarmBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AutoFarmBSCService>(AutoFarmBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
