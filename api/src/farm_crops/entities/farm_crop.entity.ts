import { Crop } from "src/crops/entities/crop.entity";
import { GrowthStage } from "src/crops-growth-stages/entities/growth-stage.entity";
import { Farm } from "src/farm/entities/farm.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('farm_crops')
export class FarmCrop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @ManyToOne(() => Farm, (farm) => farm.crops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  // @Column({ type: 'varchar', length: 100 })
  // crop!: string;

  @Column()
  crop_id!: number;

  @ManyToOne(() => Crop, (crop) => crop.farm_crops, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variety!: string;

  @Column({ type: 'date', nullable: true })
  planting_date!: Date;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @Column({ nullable: true })
  growth_stage_id!: number;

  @ManyToOne(() => GrowthStage, (growthStage) => growthStage.farm_crops, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'growth_stage_id' })
  growth_stage!: GrowthStage;
}
