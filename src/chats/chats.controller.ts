import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAuthUser } from '../auth/current-user.decorator';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('rooms')
  listRooms(@CurrentAuthUser() u: { userId: string }) {
    return this.chatsService.listRooms(u.userId);
  }

  @Post('rooms')
  createOrGetRoom(
    @CurrentAuthUser() u: { userId: string },
    @Body('participantId') participantId: string,
  ) {
    return this.chatsService.getOrCreateRoom(u.userId, participantId);
  }

  @Post('rooms/:roomId/read')
  markRead(
    @CurrentAuthUser() u: { userId: string },
    @Param('roomId') roomId: string,
  ) {
    return this.chatsService.markRead(roomId, u.userId);
  }

  @Get('rooms/:roomId/messages')
  getMessages(
    @CurrentAuthUser() u: { userId: string },
    @Param('roomId') roomId: string,
  ) {
    return this.chatsService.getMessages(roomId, u.userId);
  }

  @Post('rooms/:roomId/messages')
  postMessage(
    @CurrentAuthUser() u: { userId: string },
    @Param('roomId') roomId: string,
    @Body('text') text: string,
  ) {
    return this.chatsService.createMessage(roomId, u.userId, text);
  }
}
