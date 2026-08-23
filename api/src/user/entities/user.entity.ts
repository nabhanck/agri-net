import { Farm } from "src/farm/entities/farm.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false }) 
  password!: string; // select: false hides the password hash by default in queries

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number!: string; // Crucial if you plan to send SMS text weather advisories

  @Column({ type: 'varchar', length: 50, default: 'farmer' })
  role!: 'farmer' | 'agronomist' | 'admin'; // Restricts access scopes

  @Column({ type: 'varchar', length: 50, default: 'en' })
  preferred_language!: string; // Helps localize rule messages (e.g., "en", "hi")

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  // One user can own or manage multiple physical farms
  @OneToMany(() => Farm, (farm) => farm.user)
  farms!: Farm[];
}