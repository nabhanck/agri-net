import { Test, TestingModule } from '@nestjs/testing';
import { WeatherForecastsController } from './weather-forecasts.controller';
import { WeatherForecastsService } from './weather-forecasts.service';

describe('WeatherForecastsController', () => {
  let controller: WeatherForecastsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherForecastsController],
      providers: [WeatherForecastsService],
    }).compile();

    controller = module.get<WeatherForecastsController>(WeatherForecastsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
