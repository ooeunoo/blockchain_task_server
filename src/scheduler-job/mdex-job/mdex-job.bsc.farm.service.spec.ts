import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { MdexJobBSCFarmService } from './mdex-job.bsc.farm.service';

describe('MdexJobBSCFarmService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: MdexJobBSCFarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<MdexJobBSCFarmService>(MdexJobBSCFarmService);
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
