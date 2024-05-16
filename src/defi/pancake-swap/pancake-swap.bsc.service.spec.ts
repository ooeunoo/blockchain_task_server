import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { PancakeSwapBSCService } from './pancake-swap.bsc.service';

describe('PancakeSwapBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: PancakeSwapBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<PancakeSwapBSCService>(PancakeSwapBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFarmTotalLength', () => {
    it('is working', async () => {
      const result = await service.getFarmTotalLength();
      console.log(result);
    });
  });

  describe('getFarmInfos', () => {
    it('is working', async () => {
      const result = await service.getFarmInfos([1, 2]);
      console.log(result);
    });
  });

  describe('getAMMFactoryTotalLength', () => {
    it('is working', async () => {
      const result = await service.getAMMFactoryTotalLength();
      console.log(result);
    });
  });
  describe('getAMMInfos', () => {
    it('is working', async () => {
      const result = await service.getAMMFactoryInfos([1, 2]);
      console.log(result);
    });
  });

  describe('getAMMFactoryTotalLength', () => {
    it('is working', async () => {
      const result = await service.getAMMFactoryTotalLength();
      console.log(result);
    });
  });

  describe('getWalletFarms', () => {
    it('is working', async () => {
      const result = await service.getWalletFarms(
        '0xFDcBF476B286796706e273F86aC51163DA737FA8',
        {
          rewardTokenSymbol: 'BEL',
          addresses: ['0x55d398326f99059fF775485246999027B3197955'],
        },
      );
      console.log(JSON.stringify(result));
    });
  });

  describe('getFarm2TotalLength', () => {
    it('is working', async () => {
      const result = await service.getFarm2TotalLength();
      console.log(result);
    });
  });

  describe('getFarm2Infos', () => {
    it('is working', async () => {
      const result = await service.getFarm2Infos(10);
      console.log(result);
    });
  });
});
