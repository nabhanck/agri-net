import { Module } from '@nestjs/common';
import { WeatherForecastsService } from './weather-forecasts.service';
import { WeatherForecastsController } from './weather-forecasts.controller';

@Module({
  controllers: [WeatherForecastsController],
  providers: [WeatherForecastsService],
})
export class WeatherForecastsModule {}
