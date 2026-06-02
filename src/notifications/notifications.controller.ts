import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAuthUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentAuthUser() u: { userId: string }) {
    return this.notifications.list(u.userId);
  }

  @Get('unread-count')
  unread(@CurrentAuthUser() u: { userId: string }) {
    return this.notifications.unreadCount(u.userId).then((count) => ({ count }));
  }

  @Patch(':id/read')
  markRead(
    @Param('id') id: string,
    @CurrentAuthUser() u: { userId: string },
  ) {
    return this.notifications.markRead(id, u.userId);
  }

  @Post('read-all')
  markAll(@CurrentAuthUser() u: { userId: string }) {
    return this.notifications.markAllRead(u.userId);
  }
}
