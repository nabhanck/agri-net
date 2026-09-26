import { Crop } from "src/crops/entities/crop.entity";
import { FarmCrop } from "src/farm_crops/entities/farm_crop.entity";
import { Farm } from "src/farm/entities/farm.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity('market_prices')
export class MarketPrice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  farm_id?: number;

  @ManyToOne(() => Farm, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm?: Farm;

  @Column({ type: 'int', nullable: true })
  crop_id?: number;

  @ManyToOne(() => Crop, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'crop_id' })
  crop?: Crop;

  @Column({ type: 'int', nullable: true })
  farm_crop_id?: number;

  @ManyToOne(() => FarmCrop, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'farm_crop_id' })
  farm_crop?: FarmCrop;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  market?: string;

  @Column({ type: 'varchar', length: 100 })
  commodity!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variety?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  arrival_date?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_price?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  max_price?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  modal_price?: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency!: string;

  @Column({ type: 'jsonb', nullable: true })
  raw_data?: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fetched_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
