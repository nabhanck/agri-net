import { Farm } from "src/farm/entities/farm.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('weather_forecasts')
export class WeatherForecast {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @ManyToOne(() => Farm, (farm) => farm.weather_forecasts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  @Column({ type: 'date' })
  forecast_date!: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature_min!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature_max!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Probability percentage or decimal' })
  rain_probability!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rainfall!: number;
}