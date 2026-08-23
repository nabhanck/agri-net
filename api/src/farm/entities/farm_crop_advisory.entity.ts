import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { RuleOccurrence } from 'src/types/ruleOccurenceType';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('farm_crop_advisories')
export class FarmCropAdvisory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_crop_id!: number;

  @ManyToOne(() => FarmCrop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_crop_id' })
  farmCrop!: FarmCrop;

  @Column({ type: 'varchar', length: 100, nullable: true })
  growth_stage!: string;

  // Postgres: use 'jsonb'. MySQL: use 'json'.
  @Column({ type: 'jsonb' })
  triggered_risks!: RuleOccurrence[];

  @Column({ type: 'text', nullable: true })
  advisory!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}