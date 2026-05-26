import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toReviewDto } from '../common/mappers';
import { ModelProfileEntity } from '../profiles/entities/model-profile.entity';
import { User } from '../user/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviews: Repository<ReviewEntity>,
    @InjectRepository(ModelProfileEntity)
    private readonly profiles: Repository<ModelProfileEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(authorId: string, authorRole: string, dto: CreateReviewDto) {
    if (authorRole !== 'ADVERTISER') {
      throw new ForbiddenException('광고주만 리뷰를 작성할 수 있습니다.');
    }

    const model = await this.users.findOne({
      where: { id: Number(dto.modelId), role: 'MODEL' },
    });
    if (!model) throw new NotFoundException('모델을 찾을 수 없습니다.');

    const author = await this.users.findOne({ where: { id: Number(authorId) } });
    if (!author) throw new NotFoundException();

    const row = this.reviews.create({
      modelId: dto.modelId,
      authorId,
      authorName: author.username,
      rating: dto.rating,
      comment: dto.comment,
    });
    const saved = await this.reviews.save(row);

    await this.recalculateModelRating(dto.modelId);

    return toReviewDto(saved);
  }

  async listForModel(modelId: string) {
    const rows = await this.reviews.find({
      where: { modelId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(toReviewDto);
  }

  async listMine(modelId: string) {
    return this.listForModel(modelId);
  }

  private async recalculateModelRating(modelId: string) {
    const stats = await this.reviews
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'cnt')
      .where('r.model_id = :modelId', { modelId })
      .getRawOne<{ avg: string; cnt: string }>();

    const avg = parseFloat(stats?.avg ?? '0');
    const cnt = parseInt(stats?.cnt ?? '0', 10);
    if (!Number.isFinite(avg)) {
      throw new BadRequestException();
    }

    let profile = await this.profiles.findOne({
      where: { userId: Number(modelId) },
    });
    if (!profile) return;

    profile.rating = Math.round(avg * 10) / 10;
    profile.reviewCount = cnt;
    await this.profiles.save(profile);
  }
}
