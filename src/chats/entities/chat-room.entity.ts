import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chat_rooms')
export class ChatRoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 정규화된 키: sorted participant id들을 | 로 연결 (예: "1|m1") */
  @Column({ name: 'participants_key', unique: true })
  participantsKey: string;

  @Column('jsonb', { name: 'participant_ids' })
  participantIds: string[];

  @Column({ name: 'last_message', default: '' })
  lastMessage: string;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
