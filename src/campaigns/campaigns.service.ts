import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toCampaignDto } from '../common/mappers';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignEntity } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly campaigns: Repository<CampaignEntity>,
  ) {}

  async create(advertiserId: string, dto: CreateCampaignDto) {
    const row = this.campaigns.create({
      advertiserId,
      title: dto.title,
      brand: dto.brand,
      budget: dto.budget,
      requirements: dto.requirements,
      goals: dto.goals,
      contentStyle: dto.contentStyle,
      brandGuidelines: dto.brandGuidelines,
      productDetails: dto.productDetails,
      benefits: dto.benefits,
      type: dto.type ?? '커머셜',
      status: 'OPEN' as const,
    });
    const saved = await this.campaigns.save(row);
    return toCampaignDto(saved);
  }

  async findAll(status?: 'OPEN' | 'CLOSED') {
    const where = status ? { status } : {};
    const rows = await this.campaigns.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return rows.map(toCampaignDto);
  }

  async findMine(advertiserId: string) {
    const rows = await this.campaigns.find({
      where: { advertiserId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(toCampaignDto);
  }

  async findOne(id: string) {
    const row = await this.campaigns.findOne({ where: { id } });
    if (!row) throw new NotFoundException('캠페인을 찾을 수 없습니다.');
    return toCampaignDto(row);
  }

  async close(id: string, advertiserId: string) {
    const row = await this.campaigns.findOne({ where: { id } });
    if (!row) throw new NotFoundException('캠페인을 찾을 수 없습니다.');
    if (row.advertiserId !== advertiserId) {
      throw new ForbiddenException();
    }
    row.status = 'CLOSED';
    await this.campaigns.save(row);
    return toCampaignDto(row);
  }
}
