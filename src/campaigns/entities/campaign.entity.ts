import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CampaignStatus = 'OPEN' | 'CLOSED';

@Entity('campaigns')
export class CampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'advertiser_id' })
  advertiserId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 120 })
  brand: string;

  @Column({ length: 80 })
  budget: string;

  @Column('text')
  requirements: string;

  @Column({ type: 'text', nullable: true })
  goals: string;

  @Column({ name: 'content_style', type: 'text', nullable: true })
  contentStyle: string;

  @Column({ name: 'brand_guidelines', type: 'text', nullable: true })
  brandGuidelines: string;

  @Column({ name: 'product_details', type: 'text', nullable: true })
  productDetails: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'varchar', length: 10, default: 'OPEN' })
  status: CampaignStatus;

  @Column({ length: 40, default: '커머셜' })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
