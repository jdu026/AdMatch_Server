import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AppUserRole = 'ADVERTISER' | 'MODEL';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 32 })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20 })
  role: AppUserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
