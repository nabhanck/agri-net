import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { WeatherFetch } from './entities/weather-fetch.entity';
import { WeatherCurrent } from './entities/weather-current.entity';
import { WeatherHourly } from './entities/weather-hourly.entity';
import { WeatherDaily } from './entities/weather-daily.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Farm } from 'src/farm/entities/farm.entity';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(WeatherFetch)
    private readonly weatherFetchRepository: Repository<WeatherFetch>,

    @InjectRepository(WeatherCurrent)
    private readonly weatherCurrentRepository: Repository<WeatherCurrent>,

    @InjectRepository(WeatherHourly)
    private readonly weatherHourlyRepository: Repository<WeatherHourly>,

    @InjectRepository(WeatherDaily)
    private readonly weatherDailyRepository: Repository<WeatherDaily>,

    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
  ) { }

  async getWeather(
    latitude: number,
    longitude: number,
    farmId: number
  ) {
    const farmExists = await this.farmRepository.findOne({ where: { id: farmId } })

    if (!farmExists) {
      throw new NotFoundException(`Farm with id ${farmId} not found`);
    }

    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    const CACHE_TTL_HOURS = 6;
    const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);

    const existingFetch = await this.weatherFetchRepository.findOne({
      where: {
        farm: { id: farmId },
        fetched_at: MoreThanOrEqual(cutoff),
      },
      order: { fetched_at: 'DESC' },
    });

    if (existingFetch) {
      const [current, hourly, daily] = await Promise.all([
        this.weatherCurrentRepository.findOne({
          where: { fetch: { id: existingFetch.id } },
        }),
        this.weatherHourlyRepository.find({
          where: { fetch: { id: existingFetch.id } },
          order: { forecast_time: 'ASC' },
        }),
        this.weatherDailyRepository.find({
          where: { fetch: { id: existingFetch.id } },
          order: { forecast_date: 'ASC' },
        }),
      ]);

      return {
        fetchId: existingFetch.id,
        current,
        hourly,
        daily,
      };
    }

    const url = 'https://api.open-meteo.com/v1/forecast';

    const params = {
      latitude,
      longitude,

      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'rain',
        'wind_speed_10m',
      ].join(','),

      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'rain',
        'soil_moisture_0_to_1cm',
        'soil_moisture_1_to_3cm',
        'soil_moisture_3_to_9cm',
        'soil_moisture_9_to_27cm',
        'soil_moisture_27_to_81cm',
      ].join(','),

      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
      ].join(','),

      forecast_days: 7,

      timezone: 'auto',
    };

    const response = await firstValueFrom(
      this.httpService.get(url, { params }),
    );

    const data = response.data;

    // 2. Save the parent fetch
    const weatherFetch = this.weatherFetchRepository.create({
      farm: { id: farmId },
      latitude,
      longitude,
      elevation: data.elevation,
      timezone: data.timezone,
      raw_response: data,
    });

    const savedFetch = await this.weatherFetchRepository.save(weatherFetch);

    // 3. Save current
    const current =
      this.weatherCurrentRepository.create({
        fetch: savedFetch,
        observed_at: new Date(data.current.time),
        temperature_2m: data.current.temperature_2m,
        relative_humidity_2m:
          data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        rain: data.current.rain,
        wind_speed_10m:
          data.current.wind_speed_10m,
      });

    await this.weatherCurrentRepository.save(current);

    // 4. Save hourly
    const hourlyRows = data.hourly.time.map(
      (time: string, index: number) =>
        this.weatherHourlyRepository.create({
          fetch: savedFetch,
          forecast_time: new Date(time),

          temperature_2m:
            data.hourly.temperature_2m[index],

          relative_humidity_2m:
            data.hourly.relative_humidity_2m[index],

          precipitation_probability:
            data.hourly.precipitation_probability[index],

          precipitation:
            data.hourly.precipitation[index],

          rain:
            data.hourly.rain[index],

          soil_moisture_0_to_1cm:
            data.hourly.soil_moisture_0_to_1cm[index],

          soil_moisture_1_to_3cm:
            data.hourly.soil_moisture_1_to_3cm[index],

          soil_moisture_3_to_9cm:
            data.hourly.soil_moisture_3_to_9cm[index],
        }),
    );

    await this.weatherHourlyRepository.save(hourlyRows);

    // 5. Save daily
    const dailyRows = data.daily.time.map(
      (date: string, index: number) =>
        this.weatherDailyRepository.create({
          fetch: savedFetch,
          forecast_date: date,

          temperature_2m_max:
            data.daily.temperature_2m_max[index],

          temperature_2m_min:
            data.daily.temperature_2m_min[index],

          precipitation_sum:
            data.daily.precipitation_sum[index],

          precipitation_probability_max:
            data.daily.precipitation_probability_max[index],
        }),
    );

    await this.weatherDailyRepository.save(dailyRows);


    // return {
    //   fetchId: savedFetch.id,
    //   currentSaved: true,
    //   hourlySaved: hourlyRows.length,
    //   dailySaved: dailyRows.length,
    // };

    return {
      fetchId: savedFetch.id,
      current,
      hourly: hourlyRows,
      daily: dailyRows,
    };

  }

  create(createWeatherDto: CreateWeatherDto) {
    return 'This action adds a new weather';
  }

  findAll() {
    return `This action returns all weather`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weather`;
  }

  update(id: number, updateWeatherDto: UpdateWeatherDto) {
    return `This action updates a #${id} weather`;
  }

  remove(id: number) {
    return `This action removes a #${id} weather`;
  }
}
