import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toOfferDto } from '../common/mappers';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../user/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferEntity, OfferStatus } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferEntity)
    private readonly offers: Repository<OfferEntity>,
    @InjectRepository(CampaignEntity)
    private readonly campaigns: Repository<CampaignEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly notifications: NotificationsService,
  ) {}

  async findMine(userId: string, role: string) {
    const where =
      role === 'MODEL'
        ? { modelId: userId }
        : { advertiserId: userId };
    const rows = await this.offers.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return rows.map(toOfferDto);
  }

  async findOne(id: string) {
    const row = await this.offers.findOne({ where: { id } });
    if (!row) throw new NotFoundException('제안을 찾을 수 없습니다.');
    return toOfferDto(row);
  }

  async create(
    actorId: string,
    role: string,
    dto: CreateOfferDto,
  ) {
    const campaign = await this.campaigns.findOne({
      where: { id: dto.campaignId },
    });
    if (!campaign) throw new NotFoundException('캠페인을 찾을 수 없습니다.');
    if (campaign.status !== 'OPEN') {
      throw new BadRequestException('마감된 캠페인입니다.');
    }

    let advertiserId = campaign.advertiserId;
    let modelId = dto.modelId ?? '';

    if (role === 'ADVERTISER') {
      if (actorId !== campaign.advertiserId) {
        throw new ForbiddenException();
      }
      advertiserId = actorId;
      if (!dto.modelId) {
        throw new BadRequestException('modelId가 필요합니다.');
      }
      modelId = dto.modelId;
    } else if (role === 'MODEL') {
      modelId = actorId;
    } else {
      throw new ForbiddenException();
    }

    const modelUser = await this.users.findOne({
      where: { id: Number(modelId), role: 'MODEL' },
    });
    if (!modelUser) {
      throw new BadRequestException('유효한 모델이 아닙니다.');
    }

    const row = this.offers.create({
      campaignId: dto.campaignId,
      advertiserId,
      modelId,
      price: dto.price,
      status: 'PENDING',
    });
    const saved = await this.offers.save(row);

    const title =
      role === 'MODEL' ? '새 캠페인 지원' : '새 제안이 도착했습니다';
    const body =
      role === 'MODEL'
        ? `"${campaign.title}" 캠페인에 지원이 접수되었습니다.`
        : `"${campaign.title}" 캠페인 제안: ${dto.price}`;

    const notifyUserId = role === 'MODEL' ? advertiserId : modelId;
    await this.notifications.create(notifyUserId, title, body);

    return toOfferDto(saved);
  }

  async updateStatus(
    id: string,
    actorId: string,
    role: string,
    status: OfferStatus,
  ) {
    const row = await this.offers.findOne({ where: { id } });
    if (!row) throw new NotFoundException('제안을 찾을 수 없습니다.');

    if (role === 'MODEL') {
      if (row.modelId !== actorId) throw new ForbiddenException();
    } else if (role === 'ADVERTISER') {
      if (row.advertiserId !== actorId) throw new ForbiddenException();
    } else {
      throw new ForbiddenException();
    }

    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (role !== 'MODEL') {
        throw new ForbiddenException('모델만 수락/거절할 수 있습니다.');
      }
    }

    row.status = status;
    await this.offers.save(row);

    if (status === 'ACCEPTED') {
      await this.notifications.create(
        row.advertiserId,
        '제안 수락',
        '모델이 제안을 수락했습니다. 채팅에서 일정을 조율해 보세요.',
      );
    } else if (status === 'REJECTED') {
      await this.notifications.create(
        row.advertiserId,
        '제안 거절',
        '모델이 제안을 거절했습니다.',
      );
    }

    return toOfferDto(row);
  }
}
