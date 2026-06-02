import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { avatarUrl, ModelProfileDto, toModelProfileDto } from '../common/mappers';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ModelProfileEntity } from './entities/model-profile.entity';

export type AdvertiserProfileDto = {
  id: string;
  email: string;
  type: 'ADVERTISER';
  name: string;
  avatar: string;
  companyName?: string;
};

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ModelProfileEntity)
    private readonly profiles: Repository<ModelProfileEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async listModels(filters?: {
    q?: string;
    style?: string;
    region?: string;
    maxAge?: number;
  }): Promise<ModelProfileDto[]> {
    const qb = this.profiles
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.user', 'u')
      .where('u.role = :role', { role: 'MODEL' });

    if (filters?.q) {
      qb.andWhere(
        '(p.name ILIKE :q OR p.category::text ILIKE :q OR p.region ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }
    if (filters?.style && filters.style !== 'All') {
      qb.andWhere('p.style ILIKE :style', { style: `%${filters.style}%` });
    }
    if (filters?.region && filters.region !== 'All') {
      const regionMap: Record<string, string> = {
        Seoul: '서울',
        Busan: '부산',
        Incheon: '인천',
        Daegu: '대구',
        Gwangju: '광주',
      };
      const region = regionMap[filters.region] ?? filters.region;
      qb.andWhere('p.region ILIKE :region', { region: `%${region}%` });
    }
    if (filters?.maxAge) {
      qb.andWhere('(p.age IS NULL OR p.age <= :maxAge)', {
        maxAge: filters.maxAge,
      });
    }

    const rows = await qb.orderBy('p.rating', 'DESC').getMany();
    return rows.map((p) => toModelProfileDto(p, p.user));
  }

  async getModelById(userId: string): Promise<ModelProfileDto> {
    const profile = await this.profiles.findOne({
      where: { userId: Number(userId) },
      relations: ['user'],
    });
    if (!profile?.user) throw new NotFoundException('모델을 찾을 수 없습니다.');
    return toModelProfileDto(profile, profile.user);
  }

  async getMe(userId: string, role: string) {
    const user = await this.users.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException();

    if (user.role === 'MODEL') {
      let profile = await this.profiles.findOne({
        where: { userId: user.id },
        relations: ['user'],
      });
      if (!profile) {
        profile = await this.createDefaultModelProfile(user);
      }
      return toModelProfileDto(profile, user);
    }

    const dto: AdvertiserProfileDto = {
      id: String(user.id),
      email: `${user.username}@local`,
      type: 'ADVERTISER',
      name: user.username,
      avatar: avatarUrl(user.username),
      companyName: `${user.username} (브랜드)`,
    };
    return dto;
  }

  async updateMe(userId: string, role: string, dto: UpdateProfileDto) {
    const user = await this.users.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException();

    if (user.role === 'MODEL') {
      let profile = await this.profiles.findOne({ where: { userId: user.id } });
      if (!profile) {
        profile = await this.createDefaultModelProfile(user);
      }
      Object.assign(profile, {
        name: dto.name ?? profile.name,
        age: dto.age ?? profile.age,
        height: dto.height ?? profile.height,
        category: dto.category ?? profile.category,
        region: dto.region ?? profile.region,
        price: dto.price ?? profile.price,
        images: dto.images ?? profile.images,
        style: dto.style ?? profile.style,
        description: dto.description ?? profile.description,
      });
      await this.profiles.save(profile);
      return toModelProfileDto(profile, user);
    }

    if (dto.companyName !== undefined) {
      // 광고주는 별도 프로필 테이블 없이 표시명만 반환
    }
    return this.getMe(userId, role);
  }

  async createDefaultModelProfile(user: User): Promise<ModelProfileEntity> {
    const profile = this.profiles.create({
      userId: user.id,
      name: user.username,
      age: 24,
      height: 170,
      category: ['패션'],
      region: '서울',
      price: '협의',
      rating: 4.5,
      reviewCount: 0,
      images: [avatarUrl(user.username)],
      style: '미니멀',
      description: '',
    });
    return this.profiles.save(profile);
  }
}
