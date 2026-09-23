import { Crop } from "src/crops/entities/crop.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('advisory_rules')
export class AdvisoryRule {
  @PrimaryGeneratedColumn()
  id!: number; 
  
  @Column({ type: 'varchar', length: 100, unique: true })
  rule_code!: string;

  @ManyToOne(() => Crop, (crop) => crop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @ManyToOne(() => User, (user) => user.advisoryRules, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @Column({ type: 'varchar', length: 100 })
  stage!: string;

  @Column({ type: 'varchar', length: 50 })
  risk_level!: string;

  @Column({ type: 'varchar', length: 100 })
  risk_type!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string;

  @Column({ type: 'jsonb' })
  configuration!: {
    conditions: Array<{
      field: string; // Dynamic engine target: "temperature", "soilPh", etc.
      operator: string; // ">", "<", "=="
      value: number | string | boolean | Array<string | number>; // 8, 16, etc.
    }>;
    message: string; // Maps to result.message
  };

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'text', nullable: true })
  source?: string;

  @Column({ type: 'text', nullable: true })
  evidence?: string;
}