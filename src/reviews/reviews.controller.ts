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
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviews: ReviewsService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentAuthUser() u: { userId: string },
    @Body() dto: CreateReviewDto,
  ) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    if (!user) throw new NotFoundException();
    return this.reviews.create(u.userId, user.role, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async mine(@CurrentAuthUser() u: { userId: string }) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    if (!user) throw new NotFoundException();
    if (user.role !== 'MODEL') {
      return [];
    }
    return this.reviews.listMine(u.userId);
  }

  @Get('model/:modelId')
  listForModel(@Param('modelId') modelId: string) {
    return this.reviews.listForModel(modelId);
  }
}
