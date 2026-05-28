import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto, @Req() req: any) {
    // TODO: 인증 레이어 완료 후 req.user.id 사용
    const advertiserId = req.user?.id || 'test-advertiser-id';
    return this.campaignsService.create(advertiserId, createCampaignDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const advertiserId = req.user?.id || 'test-advertiser-id';
    return this.campaignsService.findAll(advertiserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Req() req: any,
  ) {
    const advertiserId = req.user?.id || 'test-advertiser-id';
    return this.campaignsService.update(id, advertiserId, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const advertiserId = req.user?.id || 'test-advertiser-id';
    return this.campaignsService.remove(id, advertiserId);
  }
}
