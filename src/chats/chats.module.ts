import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { RoomReadEntity } from './entities/room-read.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatMessageEntity,
      RoomReadEntity,
    ]),
    NotificationsModule,
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
