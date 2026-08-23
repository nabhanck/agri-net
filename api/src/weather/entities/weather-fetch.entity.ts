import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { WeatherCurrent } from './weather-current.entity';
import { WeatherHourly } from './weather-hourly.entity';
import { WeatherDaily } from './weather-daily.entity';
import { Farm } from 'src/farm/entities/farm.entity';

@Entity('weather_fetches')
export class WeatherFetch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Column({ type: 'double precision', nullable: true })
  elevation!: number;

  @Column({ type: 'varchar', length: 100 })
  timezone!: string;

  /**
   * When we fetched the data from the weather provider.
   */
  @CreateDateColumn()
  fetched_at!: Date;

  /**
   * Complete response from the weather API.
   */
  @Column({ type: 'jsonb' })
  raw_response!: Record<string, any>;

  @OneToMany(
    () => WeatherCurrent,
    (weatherCurrent) => weatherCurrent.fetch,
  )
  current!: WeatherCurrent[];

  @OneToMany(
    () => WeatherHourly,
    (weatherHourly) => weatherHourly.fetch,
  )
  hourly!: WeatherHourly[];

  @OneToMany(
    () => WeatherDaily,
    (weatherDaily) => weatherDaily.fetch,
  )
  daily!: WeatherDaily[];

  @ManyToOne(
    () => Farm,
    (farm) => farm.weatherFetches,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  }