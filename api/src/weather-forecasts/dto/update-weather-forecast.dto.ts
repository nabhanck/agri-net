import { PartialType } from '@nestjs/mapped-types';
import { CreateWeatherForecastDto } from './create-weather-forecast.dto';

export class UpdateWeatherForecastDto extends PartialType(CreateWeatherForecastDto) {}
