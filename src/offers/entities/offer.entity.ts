import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OfferStatus } from '../../common/enums/status.enum';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  campaignId: string;

  @Column()
  advertiserId: string;

  @Column()
  modelId: string;

  @Column({ type: 'bigint' })
  price: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.SENT,
  })
  status: OfferStatus;

  @Column({ type: 'bigint', nullable: true })
  counterPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  counterStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  counterEndDate: Date;

  @Column({ type: 'text', nullable: true })
  rejectReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
