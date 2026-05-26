import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppNotificationEntity } from './entities/app-notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(AppNotificationEntity)
    private readonly repo: Repository<AppNotificationEntity>,
  ) {}

  async list(userId: string) {
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      title: r.title,
      body: r.body,
      isRead: r.isRead,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  unreadCount(userId: string) {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async create(userId: string, title: string, body: string) {
    const row = this.repo.create({ userId, title, body, isRead: false });
    return this.repo.save(row);
  }

  async markRead(id: string, userId: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row || row.userId !== userId) {
      throw new NotFoundException();
    }
    row.isRead = true;
    return this.repo.save(row);
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { ok: true };
  }
}
