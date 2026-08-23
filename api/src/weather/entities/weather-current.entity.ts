import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

import { WeatherFetch } from './weather-fetch.entity';

@Entity('weather_current')
export class WeatherCurrent {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => WeatherFetch,
    (fetch) => fetch.current,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fetch_id' })
  fetch!: WeatherFetch;

  @Column({ type: 'timestamptz' })
  observed_at!: Date;

  @Column({ type: 'double precision' })
  temperature_2m!: number;

  @Column({ type: 'double precision' })
  relative_humidity_2m!: number;

  @Column({ type: 'double precision', default: 0 })
  precipitation!: number;

  @Column({ type: 'double precision', default: 0 })
  rain!: number;

  @Column({ type: 'double precision', nullable: true })
  wind_speed_10m!: number;
}