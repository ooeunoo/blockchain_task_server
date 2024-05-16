import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { NFTokenService } from './nf-token.service';

describe('NFTokenService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: NFTokenService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<NFTokenService>(NFTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findFarms', () => {
    it('is working', async () => {
      const entity = await service.searchDistinct(
        { protocolId: 19 },
        'token_uri',
      );
      console.log(entity);
    });
  });
});
