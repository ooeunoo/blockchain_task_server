import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { AutoFarmBSCFarmService } from './auto-farm-job.bsc.farm.service';

describe('AutoFarmBSCFarmService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AutoFarmBSCFarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AutoFarmBSCFarmService>(AutoFarmBSCFarmService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('is working', async () => {
      await service.run();
    });
  });
});
