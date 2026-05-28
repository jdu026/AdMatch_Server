import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchStatus } from '../common/enums/status.enum';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async findAll(userId: string): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [
        { advertiserId: userId },
        { modelId: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async updateStatus(id: string, userId: string, status: MatchStatus): Promise<Match> {
    const match = await this.findOne(id);

    // 권한 체크
    if (match.advertiserId !== userId && match.modelId !== userId) {
      throw new ForbiddenException('You are not a participant of this match');
    }

    // 비즈니스 로직: 완료는 광고주만 가능하게 할 수도 있음 (검수 완료 시)
    if (status === MatchStatus.COMPLETED && match.advertiserId !== userId) {
      throw new ForbiddenException('Only the advertiser can mark the match as completed');
    }

    match.status = status;
    if (status === MatchStatus.COMPLETED) {
      match.completedAt = new Date();
    }

    return await this.matchRepository.save(match);
  }
}
