import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { NetworkService } from './network.service';
import { getConnection } from 'typeorm';

describe('NetworkService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: NetworkService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<NetworkService>(NetworkService);
  });

  it('정의', () => {
    expect(service).toBeDefined();
  });

  describe('단일 조회', () => {
    it('is working', async () => {
      const result = await service.findNetwork({ chain_id: 1 });
      console.log(result);
    });
  });
});
