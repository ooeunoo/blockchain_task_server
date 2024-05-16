import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { InteractionService } from './Interaction.service';
import { NetworkService } from '../network/network.service';

describe('InteractionService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: InteractionService;
  let networkService: NetworkService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<InteractionService>(InteractionService);
    networkService = app.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createIfNotExistInteractions', () => {
    it('is working', async () => {
      const result = await service.findInteractions({ from_address: '' });
      console.log(result);
    });
  });
});
