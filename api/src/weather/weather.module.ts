import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherFetch } from './entities/weather-fetch.entity';
import { WeatherCurrent } from './entities/weather-current.entity';
import { WeatherHourly } from './entities/weather-hourly.entity';
import { WeatherDaily } from './entities/weather-daily.entity';
import { Farm } from 'src/farm/entities/farm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WeatherFetch,
      WeatherCurrent,
      WeatherHourly,
      WeatherDaily,
      Farm
    ]),
    HttpModule
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService]
})
export class WeatherModule {}
