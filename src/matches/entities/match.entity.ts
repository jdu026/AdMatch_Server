import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MatchStatus } from '../../common/enums/status.enum';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  offerId: string;

  @Column()
  campaignId: string;

  @Column()
  advertiserId: string;

  @Column()
  modelId: string;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.IN_PROGRESS,
  })
  status: MatchStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
