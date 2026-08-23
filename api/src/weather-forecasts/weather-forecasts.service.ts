import { Injectable } from '@nestjs/common';
import { CreateWeatherForecastDto } from './dto/create-weather-forecast.dto';
import { UpdateWeatherForecastDto } from './dto/update-weather-forecast.dto';

@Injectable()
export class WeatherForecastsService {
  create(createWeatherForecastDto: CreateWeatherForecastDto) {
    return 'This action adds a new weatherForecast';
  }

  findAll() {
    return `This action returns all weatherForecasts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weatherForecast`;
  }

  update(id: number, updateWeatherForecastDto: UpdateWeatherForecastDto) {
    return `This action updates a #${id} weatherForecast`;
  }

  remove(id: number) {
    return `This action removes a #${id} weatherForecast`;
  }
}
