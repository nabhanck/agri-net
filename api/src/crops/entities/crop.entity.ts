import { AdvisoryRule } from "src/advisory-rules/entities/advisory-rule.entity";
import { FarmCrop } from "src/farm_crops/entities/farm_crop.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string; // "rice", "wheat" -> Used by your rule engine JSON

  @Column({ type: 'varchar', length: 100 })
  name!: string; // "Rice", "Wheat"

  @Column({ type: 'varchar', length: 100, nullable: true })
  variety!: string; // "Rice", "Wheat"

  @Column({ type: 'varchar', length: 100, nullable: true })
  scientific_name!: string;

  // @OneToMany(() => FarmCrop, (farmCrop) => farmCrop.crop)
  // farm_crops!: FarmCrop[];

  @OneToMany(() => FarmCrop, (farmCrop) => farmCrop.crop)
  farm_crops!: FarmCrop[];

  // crop.entity.ts
  // @ManyToMany(() => FarmCrop, (farm) => farm.crop)
  // farms!: FarmCrop[];

  @OneToMany(() => AdvisoryRule, (rule) => rule.crop)
  advisory!: AdvisoryRule[];
}
