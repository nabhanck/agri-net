import { Crop } from "src/crops/entities/crop.entity";
import { FarmCrop } from "src/farm_crops/entities/farm_crop.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('growth_stages')
export class GrowthStage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  crop_id!: number;

  @ManyToOne(() => Crop, (crop) => crop.growth_stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @Column({ type: 'varchar', length: 100 })
  stage_name!: string;

  @Column({ type: 'int' })
  stage_order!: number;

  @Column({ type: 'int', default: 0 })
  duration_days!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @OneToMany(() => FarmCrop, (farmCrop) => farmCrop.growth_stage)
  farm_crops!: FarmCrop[];
}
