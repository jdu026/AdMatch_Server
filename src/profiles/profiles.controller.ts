import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAuthUser } from '../auth/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller()
export class ProfilesController {
  constructor(
    private readonly profiles: ProfilesService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  @Get('models')
  listModels(
    @Query('q') q?: string,
    @Query('style') style?: string,
    @Query('region') region?: string,
    @Query('maxAge') maxAge?: string,
  ) {
    return this.profiles.listModels({
      q,
      style,
      region,
      maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
    });
  }

  @Get('models/:id')
  getModel(@Param('id') id: string) {
    return this.profiles.getModelById(id);
  }

  @Get('profiles/me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentAuthUser() u: { userId: string }) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    return this.profiles.getMe(u.userId, user?.role ?? 'ADVERTISER');
  }

  @Patch('profiles/me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentAuthUser() u: { userId: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.users.findOne({ where: { id: Number(u.userId) } });
    return this.profiles.updateMe(u.userId, user?.role ?? 'ADVERTISER', dto);
  }
}
