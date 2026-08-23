import { Farm } from "src/farm/entities/farm.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('advisories')
export class Advisory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @ManyToOne(() => Farm, (farm) => farm.advisories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'varchar', length: 50 })
  severity!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  recommendation!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string;
}




