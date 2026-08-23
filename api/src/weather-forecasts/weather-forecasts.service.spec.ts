import { Test, TestingModule } from '@nestjs/testing';
import { WeatherForecastsService } from './weather-forecasts.service';

describe('WeatherForecastsService', () => {
  let service: WeatherForecastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherForecastsService],
    }).compile();

    service = module.get<WeatherForecastsService>(WeatherForecastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
