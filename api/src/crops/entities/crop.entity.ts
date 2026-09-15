import { AdvisoryRule } from "src/advisory-rules/entities/advisory-rule.entity";
import { GrowthStage } from "src/crops-growth-stages/entities/growth-stage.entity";
import { FarmCrop } from "src/farm_crops/entities/farm_crop.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string; // "rice", "wheat" -> Used by your rule engine JSON

  @Column({ type: 'varchar', length: 100 })
  name!: string; // "Rice", "Wheat"

  @Column({ type: 'text', array: true, nullable: true })
  varieties!: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  family!: string; // "Poaceae", "Fabaceae", etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  water_requirement!: string; // "High", "Medium", "Low", etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  growing_season!: string; // "Kharif", "Rabi", "Zaid", "Year-round"

  @Column({ type: 'int', nullable: true })
  maturity_days!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  scientific_name!: string;

  @Column({ type: 'float', array: true, nullable: true })
  optimal_ph_range!: number[];

  @OneToMany(() => FarmCrop, (farmCrop) => farmCrop.crop)
  farm_crops!: FarmCrop[];

  @OneToMany(() => AdvisoryRule, (rule) => rule.crop)
  advisory!: AdvisoryRule[];

  @OneToMany(() => GrowthStage, (growthStage) => growthStage.crop)
  growth_stages!: GrowthStage[];
}
