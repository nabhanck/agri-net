import { Test, TestingModule } from '@nestjs/testing';
import { MarketPriceService } from './market-price.service';

describe('MarketPriceService', () => {
  let service: MarketPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketPriceService],
    }).compile();

    service = module.get<MarketPriceService>(MarketPriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
