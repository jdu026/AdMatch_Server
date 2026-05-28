import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advertiserId: string; // 광고주 ID (User ID or Profile ID)

  @Column()
  title: string;

  @Column()
  brandName: string;

  @Column({ nullable: true })
  objective: string;

  @Column({ nullable: true })
  contentType: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'bigint' })
  budget: number;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
