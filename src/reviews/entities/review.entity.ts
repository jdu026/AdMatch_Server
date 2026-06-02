import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'model_id' })
  modelId: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'author_name', length: 100 })
  authorName: string;

  @Column({ type: 'int' })
  rating: number;

  @Column('text')
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
