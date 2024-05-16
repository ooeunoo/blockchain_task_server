import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { ProtocolService } from './protocol.service';
import { NetworkService } from '../network/network.service';

describe('TokenService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: ProtocolService;
  let networkService: NetworkService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<ProtocolService>(ProtocolService);
    networkService = app.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProtocolWithToken', () => {
    it('is working', async () => {
      const network = await networkService.findNetwork({ chain_id: 1 });
      const entities = await service.findProtocolWithToken({
        network,
        name: 'SushiSwap',
      });
      console.log(entities);
    });
  });
});
