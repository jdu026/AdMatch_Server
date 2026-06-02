import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

@Entity('offers')
export class OfferEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @Column({ name: 'advertiser_id' })
  advertiserId: string;

  @Column({ name: 'model_id' })
  modelId: string;

  @Column({ length: 80 })
  price: string;

  @Column({ type: 'varchar', length: 12, default: 'PENDING' })
  status: OfferStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
