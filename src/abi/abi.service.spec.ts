import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { AbiService } from './abi.service';

describe('AbiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AbiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AbiService>(AbiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAbi', () => {
    it('is working', async () => {
      const entity = await service.findAbi({
        address: '0xfD36E2c2a6789Db23113685031d7F16329158384',
      });
      console.log(entity);
    });
  });

  describe('findAbis', () => {
    it('is working', async () => {
      const entity = await service.findAbis({
        network: {
          id: 7,
        },
      });
      console.log(entity);
    });
  });
});
