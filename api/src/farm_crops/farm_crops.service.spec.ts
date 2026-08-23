import { Test, TestingModule } from '@nestjs/testing';
import { FarmCropsService } from './farm_crops.service';

describe('FarmCropsService', () => {
  let service: FarmCropsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmCropsService],
    }).compile();

    service = module.get<FarmCropsService>(FarmCropsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
