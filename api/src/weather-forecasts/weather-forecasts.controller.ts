import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeatherForecastsService } from './weather-forecasts.service';
import { CreateWeatherForecastDto } from './dto/create-weather-forecast.dto';
import { UpdateWeatherForecastDto } from './dto/update-weather-forecast.dto';

@Controller('weather-forecasts')
export class WeatherForecastsController {
  constructor(private readonly weatherForecastsService: WeatherForecastsService) {}

  @Post()
  create(@Body() createWeatherForecastDto: CreateWeatherForecastDto) {
    return this.weatherForecastsService.create(createWeatherForecastDto);
  }

  @Get()
  findAll() {
    return this.weatherForecastsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weatherForecastsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeatherForecastDto: UpdateWeatherForecastDto) {
    return this.weatherForecastsService.update(+id, updateWeatherForecastDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weatherForecastsService.remove(+id);
  }
}
