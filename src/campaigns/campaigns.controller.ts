import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAuthUser } from '../auth/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  @Get()
  findAll(@Query('status') status?: 'OPEN' | 'CLOSED') {
    return this.campaignsService.findAll(status);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentAuthUser() u: { userId: string }) {
    return this.campaignsService.findMine(u.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentAuthUser() u: { userId: string },
    @Body() dto: CreateCampaignDto,
  ) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    if (!user) throw new NotFoundException();
    if (user.role !== 'ADVERTISER') {
      throw new ForbiddenException('광고주만 캠페인을 등록할 수 있습니다.');
    }
    return this.campaignsService.create(u.userId, dto);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  close(@CurrentAuthUser() u: { userId: string }, @Param('id') id: string) {
    return this.campaignsService.close(id, u.userId);
  }
}
