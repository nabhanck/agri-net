import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { WeatherFetch } from './weather-fetch.entity';

@Entity('weather_hourly')
@Index(['fetch', 'forecast_time'])
export class WeatherHourly {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => WeatherFetch,
    (fetch) => fetch.hourly,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fetch_id' })
  fetch!: WeatherFetch;

  /**
   * The time this forecast is predicting.
   */
  @Column({ type: 'timestamptz' })
  forecast_time!: Date;

  @Column({ type: 'double precision', nullable: true })
  temperature_2m!: number;

  @Column({ type: 'double precision', nullable: true })
  relative_humidity_2m!: number;

  @Column({ type: 'double precision', nullable: true })
  precipitation_probability!: number;

  @Column({ type: 'double precision', nullable: true })
  precipitation!: number;

  @Column({ type: 'double precision', nullable: true })
  rain!: number;

  @Column({ type: 'double precision', nullable: true })
  soil_moisture_0_to_1cm!: number;

  @Column({ type: 'double precision', nullable: true })
  soil_moisture_1_to_3cm!: number;

  @Column({ type: 'double precision', nullable: true })
  soil_moisture_3_to_9cm!: number;
}