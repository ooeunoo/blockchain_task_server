import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { AppSchedulerService } from './app-scheduler.service';

describe('AppSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AppSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AppSchedulerService>(AppSchedulerService);
  });

  beforeEach(() => {
    jest.useFakeTimers('modern');
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('is working', async () => {});
  });
});
