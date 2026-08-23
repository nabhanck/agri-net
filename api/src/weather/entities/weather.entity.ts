import { Farm } from "src/farm/entities/farm.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('weather_observations')
export class WeatherObservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @ManyToOne(() => Farm, (farm) => farm.weather_observations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  humidity!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rainfall!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  wind_speed!: number;
}




