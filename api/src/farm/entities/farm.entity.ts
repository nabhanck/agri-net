import { Advisory } from "src/advisory/entities/advisory.entity"; 
import { Crop } from "src/crops/entities/crop.entity";
import { FarmCrop } from "src/farm_crops/entities/farm_crop.entity";
import { User } from "src/user/entities/user.entity";
import { WeatherForecast } from "src/weather-forecasts/entities/weather-forecast.entity";
import { WeatherFetch } from "src/weather/entities/weather-fetch.entity";
import { WeatherObservation } from "src/weather/entities/weather.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('farms')
export class Farm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area!: number;

  @Column({ type: 'varchar', length: 255, default: 'acres' })
  area_unit!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  soil_type!: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true }) 
  soilPh!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  irrigation_type!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  farming_practice!: string; 

  @OneToMany(() => FarmCrop, (farmCrop) => farmCrop.farm)
  crops!: FarmCrop[]; 

  @OneToMany(() => WeatherObservation, (obs) => obs.farm)
  weather_observations!: WeatherObservation[];

  @OneToMany(() => WeatherForecast, (fc) => fc.farm)
  weather_forecasts!: WeatherForecast[];

  @OneToMany(() => Advisory, (advisory) => advisory.farm)
  advisories!: Advisory[];

  @ManyToOne(() => User, (user) => user.farms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(
    () => WeatherFetch,
    (weatherFetch) => weatherFetch.farm,
  )
  weatherFetches!: WeatherFetch[];
}
