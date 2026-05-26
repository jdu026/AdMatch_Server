import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from '../chats/entities/chat-message.entity';
import { ChatRoomEntity } from '../chats/entities/chat-room.entity';
import { ModelProfileEntity } from '../profiles/entities/model-profile.entity';
import { avatarUrl } from '../common/mappers';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(ModelProfileEntity)
    private readonly profiles: Repository<ModelProfileEntity>,
    @InjectRepository(ChatRoomEntity)
    private readonly rooms: Repository<ChatRoomEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messages: Repository<ChatMessageEntity>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const taken = await this.users.findOne({
      where: { username: dto.username.toLowerCase() },
    });
    if (taken) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      username: dto.username.toLowerCase(),
      passwordHash,
      role: dto.role,
    });
    await this.users.save(user);
    if (dto.role === 'MODEL') {
      await this.profiles.save(
        this.profiles.create({
          userId: user.id,
          name: user.username,
          age: 24,
          height: 170,
          category: ['패션'],
          region: '서울',
          price: '협의',
          rating: 0,
          reviewCount: 0,
          images: [avatarUrl(user.username)],
          style: '미니멀',
          description: '',
        }),
      );
    }
    const userId = String(user.id);
    await this.seedWelcomeRoom(userId);
    return this.buildTokenResponse(user);
  }

  async login(username: string, password: string) {
    const user = await this.users.findOne({
      where: { username: username.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    return this.buildTokenResponse(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: Number(userId) } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: String(user.id),
      username: user.username,
      role: user.role,
    };
  }

  private buildTokenResponse(user: User) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: String(user.id),
        username: user.username,
        role: user.role,
      },
    };
  }

  private participantsKey(a: string, b: string): string {
    return [a, b].sort((x, y) => x.localeCompare(y)).join('|');
  }

  private async seedWelcomeRoom(userId: string): Promise<void> {
    const model = await this.users.findOne({
      where: { role: 'MODEL' },
      order: { id: 'ASC' },
    });
    if (!model) return;
    const otherId = String(model.id);
    const key = this.participantsKey(userId, otherId);
    const existing = await this.rooms.findOne({ where: { participantsKey: key } });
    if (existing) return;

    const room = this.rooms.create({
      participantsKey: key,
      participantIds: [userId, otherId].sort((x, y) => x.localeCompare(y)),
      lastMessage: '여름 캠페인 촬영을 진행하고 싶습니다.',
      lastMessageAt: new Date(),
    });
    await this.rooms.save(room);

    const seed = [
      {
        roomId: room.id,
        senderId: otherId,
        text: '안녕하세요! 포트폴리오를 보고 연락 주셔서 감사합니다.',
      },
      {
        roomId: room.id,
        senderId: otherId,
        text: '여름 캠페인 촬영을 진행하고 싶습니다.',
      },
    ];
    for (const row of seed) {
      await this.messages.save(this.messages.create(row));
    }
  }
}
