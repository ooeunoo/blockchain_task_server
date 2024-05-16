import { TestModule } from '../../app-scheduler/app-scheduler.test.module';
import { INestApplication } from '@nestjs/common';
import { InteractionBSCService } from './interaction.job.bsc.service';

describe('InteractionBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: InteractionBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<InteractionBSCService>(InteractionBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('is working', async () => {
      while (true) {
        await service.run();
      }
    });
  });
});
