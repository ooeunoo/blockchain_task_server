import { Test, TestingModule } from '@nestjs/testing';
import { LendingService } from './lending.service';

describe('LendingService', () => {
  let service: LendingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LendingService],
    }).compile();

    service = module.get<LendingService>(LendingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
