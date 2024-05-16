import { TestModule } from '../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { TokenService } from './token.service';
import { In, Like, Not } from 'typeorm';

describe('TokenService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: TokenService;
  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findTokens', () => {
    it('is working', async () => {
      const result = await service.findToken({
        address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
      });
      console.log(result);
    });

    it('is working 2', async () => {
      const result = await service.findToken({
        address: '0x0000000000000000000000000000000000000000',
        network: {
          chain_id: 1,
        },
      });
      console.log(result);
    });
  });
});
