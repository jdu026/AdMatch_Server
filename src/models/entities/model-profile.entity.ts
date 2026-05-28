import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('model_profiles')
export class ModelProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  displayName: string;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'bigint', default: 0 })
  basePrice: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  snsUrls: string[];

  @Column({ default: 'PENDING' })
  approvalStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
