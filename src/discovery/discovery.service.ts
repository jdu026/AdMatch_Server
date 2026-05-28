import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelProfile } from '../models/entities/model-profile.entity';

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(ModelProfile)
    private readonly modelProfileRepository: Repository<ModelProfile>,
  ) {}

  async create(data: Partial<ModelProfile>): Promise<ModelProfile> {
    const profile = this.modelProfileRepository.create(data);
    return await this.modelProfileRepository.save(profile);
  }

  async findModels(filters: {
    category?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    const query = this.modelProfileRepository.createQueryBuilder('model');

    if (filters.category) {
      query.andWhere('model.categories LIKE :category', { category: `%${filters.category}%` });
    }

    if (filters.region) {
      query.andWhere('model.region = :region', { region: filters.region });
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      query.andWhere('model.basePrice BETWEEN :min AND :max', {
        min: filters.minPrice,
        max: filters.maxPrice,
      });
    } else if (filters.minPrice !== undefined) {
      query.andWhere('model.basePrice >= :min', { min: filters.minPrice });
    } else if (filters.maxPrice !== undefined) {
      query.andWhere('model.basePrice <= :max', { max: filters.maxPrice });
    }

    // 기본적으로 승인된 모델만 노출
    query.andWhere("model.approvalStatus = 'APPROVED'");

    // 정렬
    switch (filters.sort) {
      case 'price_asc':
        query.orderBy('model.basePrice', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('model.basePrice', 'DESC');
        break;
      case 'rating':
        query.orderBy('model.averageRating', 'DESC');
        break;
      default:
        query.orderBy('model.createdAt', 'DESC');
    }

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
    };
  }
}
