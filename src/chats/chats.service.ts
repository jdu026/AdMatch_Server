import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { RoomReadEntity } from './entities/room-read.entity';

export type ChatRoomDto = {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
};

export type ChatMessageDto = {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: string;
};

function formatKoTime(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function participantsKey(a: string, b: string): string {
  return [a, b].sort((x, y) => x.localeCompare(y)).join('|');
}

function isDbUserId(id: string): boolean {
  return /^\d+$/.test(id);
}

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly rooms: Repository<ChatRoomEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messages: Repository<ChatMessageEntity>,
    @InjectRepository(RoomReadEntity)
    private readonly reads: Repository<RoomReadEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  private assertMember(room: ChatRoomEntity, userId: string) {
    if (!room.participantIds.includes(userId)) {
      throw new ForbiddenException();
    }
  }

  private async getLastReadAt(roomId: string, userId: string): Promise<Date> {
    const row = await this.reads.findOne({
      where: { roomId, userId },
    });
    return row?.lastReadAt ?? new Date(0);
  }

  private async unreadForRoom(
    room: ChatRoomEntity,
    userId: string,
  ): Promise<number> {
    const since = await this.getLastReadAt(room.id, userId);
    return this.messages
      .createQueryBuilder('m')
      .where('m.room_id = :roomId', { roomId: room.id })
      .andWhere('m.sender_id != :userId', { userId })
      .andWhere('m.created_at > :since', { since })
      .getCount();
  }

  async listRooms(userId: string): Promise<ChatRoomDto[]> {
    const list = await this.rooms
      .createQueryBuilder('r')
      .where('r.participant_ids @> :pid::jsonb', {
        pid: JSON.stringify([userId]),
      })
      .orderBy('r.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('r.created_at', 'DESC')
      .getMany();

    const out: ChatRoomDto[] = [];
    for (const room of list) {
      const unreadCount = await this.unreadForRoom(room, userId);
      out.push({
        id: room.id,
        participants: room.participantIds,
        lastMessage: room.lastMessage,
        timestamp: formatKoTime(room.lastMessageAt),
        unreadCount,
      });
    }
    return out;
  }

  async getMessages(roomId: string, userId: string): Promise<ChatMessageDto[]> {
    const room = await this.rooms.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException();
    this.assertMember(room, userId);

    const rows = await this.messages.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      senderId: m.senderId,
      text: m.text,
      timestamp: formatKoTime(m.createdAt),
    }));
  }

  async createMessage(
    roomId: string,
    userId: string,
    text: string,
  ): Promise<ChatMessageDto> {
    const room = await this.rooms.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException();
    this.assertMember(room, userId);

    const trimmed = text.trim();
    if (!trimmed) {
      throw new BadRequestException('빈 메시지는 보낼 수 없습니다.');
    }

    const msg = this.messages.create({
      roomId,
      senderId: userId,
      text: trimmed,
    });
    await this.messages.save(msg);

    room.lastMessage = trimmed;
    room.lastMessageAt = msg.createdAt;
    await this.rooms.save(room);

    for (const pid of room.participantIds) {
      if (pid === userId) continue;
      if (isDbUserId(pid)) {
        const preview =
          trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
        await this.notifications.create(pid, '새 메시지', preview);
      }
    }

    return {
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      text: msg.text,
      timestamp: formatKoTime(msg.createdAt),
    };
  }

  async getOrCreateRoom(
    userId: string,
    otherId: string,
  ): Promise<ChatRoomDto> {
    if (otherId === userId) {
      throw new ForbiddenException('자기 자신과는 채팅방을 만들 수 없습니다.');
    }
    const key = participantsKey(userId, otherId);
    let room = await this.rooms.findOne({ where: { participantsKey: key } });
    if (!room) {
      room = this.rooms.create({
        participantsKey: key,
        participantIds: [userId, otherId].sort((a, b) => a.localeCompare(b)),
        lastMessage: '',
        lastMessageAt: null,
      });
      await this.rooms.save(room);
    }
    const unreadCount = await this.unreadForRoom(room, userId);
    return {
      id: room.id,
      participants: room.participantIds,
      lastMessage: room.lastMessage,
      timestamp: formatKoTime(room.lastMessageAt),
      unreadCount,
    };
  }

  async markRead(roomId: string, userId: string): Promise<{ ok: boolean }> {
    const room = await this.rooms.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException();
    this.assertMember(room, userId);

    const now = new Date();
    const existing = await this.reads.findOne({
      where: { roomId, userId },
    });
    if (existing) {
      existing.lastReadAt = now;
      await this.reads.save(existing);
    } else {
      await this.reads.save(
        this.reads.create({ roomId, userId, lastReadAt: now }),
      );
    }
    return { ok: true };
  }
}
