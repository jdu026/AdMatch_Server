import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  async create(advertiserId: string, createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      advertiserId,
    });
    return await this.campaignRepository.save(campaign);
  }

  async findAll(advertiserId: string): Promise<Campaign[]> {
    return await this.campaignRepository.find({
      where: { advertiserId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async update(id: string, advertiserId: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.advertiserId !== advertiserId) {
      throw new ForbiddenException('You do not have permission to update this campaign');
    }

    Object.assign(campaign, updateCampaignDto);
    return await this.campaignRepository.save(campaign);
  }

  async remove(id: string, advertiserId: string): Promise<void> {
    const campaign = await this.findOne(id);
    if (campaign.advertiserId !== advertiserId) {
      throw new ForbiddenException('You do not have permission to delete this campaign');
    }
    await this.campaignRepository.remove(campaign);
  }
}
