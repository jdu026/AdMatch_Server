import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAuthUser } from '../auth/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentAuthUser() u: { userId: string }) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    if (!user) throw new NotFoundException();
    return this.offersService.findMine(u.userId, user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentAuthUser() u: { userId: string },
    @Body() dto: CreateOfferDto,
  ) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    if (!user) throw new NotFoundException();
    return this.offersService.create(u.userId, user.role, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @CurrentAuthUser() u: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateOfferStatusDto,
  ) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    if (!user) throw new NotFoundException();
    return this.offersService.updateStatus(
      id,
      u.userId,
      user.role,
      dto.status,
    );
  }
}
