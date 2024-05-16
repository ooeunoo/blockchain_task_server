import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { MdexJobBSCPairService } from './mdex-job.bsc.pair.service';

describe('MdexJobBSCPairService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: MdexJobBSCPairService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<MdexJobBSCPairService>(MdexJobBSCPairService);
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
