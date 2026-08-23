import { Crop } from "src/crops/entities/crop.entity";
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

  @Column({ type: 'varchar', length: 100, nullable: true })
  growth_stage!: string;
}
