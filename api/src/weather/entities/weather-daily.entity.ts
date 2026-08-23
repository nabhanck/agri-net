import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { WeatherFetch } from './weather-fetch.entity';

@Entity('weather_daily')
@Index(['fetch', 'forecast_date'])
export class WeatherDaily {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => WeatherFetch,
    (fetch) => fetch.daily,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fetch_id' })
  fetch!: WeatherFetch;

  /**
   * Date this forecast applies to.
   */
  @Column({ type: 'date' })
  forecast_date!: string;

  @Column({ type: 'double precision', nullable: true })
  temperature_2m_max!: number;

  @Column({ type: 'double precision', nullable: true })
  temperature_2m_min!: number;

  @Column({ type: 'double precision', nullable: true })
  precipitation_sum!: number;

  @Column({ type: 'double precision', nullable: true })
  precipitation_probability_max!: number;
}