import { Test, TestingModule } from '@nestjs/testing';
import { MarketPriceController } from './market-price.controller';
import { MarketPriceService } from './market-price.service';

describe('MarketPriceController', () => {
  let controller: MarketPriceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketPriceController],
      providers: [MarketPriceService],
    }).compile();

    controller = module.get<MarketPriceController>(MarketPriceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
