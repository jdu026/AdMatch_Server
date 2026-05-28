import { Controller, Get, Post, Body, Param, Req, Query } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto, CounterOfferDto, RejectOfferDto } from './dto/offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: any) {
    const advertiserId = req.headers['x-user-id'] || req.user?.id || 'test-advertiser-id';
    return this.offersService.create(advertiserId, createOfferDto);
  }

  @Get()
  findAll(@Req() req: any, @Query('role') role: 'advertiser' | 'model') {
    const userId = req.headers['x-user-id'] || req.user?.id || 'test-user-id';
    return this.offersService.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Req() req: any) {
    const modelId = req.headers['x-user-id'] || req.user?.id || 'test-model-id';
    return this.offersService.accept(id, modelId);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() rejectOfferDto: RejectOfferDto, @Req() req: any) {
    const modelId = req.headers['x-user-id'] || req.user?.id || 'test-model-id';
    return this.offersService.reject(id, modelId, rejectOfferDto);
  }

  @Post(':id/counter')
  counter(@Param('id') id: string, @Body() counterOfferDto: CounterOfferDto, @Req() req: any) {
    const modelId = req.headers['x-user-id'] || req.user?.id || 'test-model-id';
    return this.offersService.counter(id, modelId, counterOfferDto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    const advertiserId = req.headers['x-user-id'] || req.user?.id || 'test-advertiser-id';
    return this.offersService.cancel(id, advertiserId);
  }
}
