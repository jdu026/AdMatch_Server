import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('model_profiles')
export class ModelProfileEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column('jsonb', { default: () => "'[]'" })
  category: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  price: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column('jsonb', { default: () => "'[]'" })
  images: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  style: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'company_name', type: 'varchar', length: 120, nullable: true })
  companyName: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
