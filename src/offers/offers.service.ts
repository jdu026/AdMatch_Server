import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { OfferStatus, MatchStatus } from '../common/enums/status.enum';
import { CreateOfferDto, CounterOfferDto, RejectOfferDto } from './dto/offer.dto';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async create(advertiserId: string, createOfferDto: CreateOfferDto): Promise<Offer> {
    const offer = this.offerRepository.create({
      ...createOfferDto,
      advertiserId,
      status: OfferStatus.SENT,
    });
    return await this.offerRepository.save(offer);
  }

  async findAll(userId: string, role: 'advertiser' | 'model'): Promise<Offer[]> {
    const where = role === 'advertiser' ? { advertiserId: userId } : { modelId: userId };
    return await this.offerRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  async accept(id: string, modelId: string): Promise<Match> {
    const offer = await this.findOne(id);
    if (offer.modelId !== modelId) {
      throw new ForbiddenException('You do not have permission to accept this offer');
    }
    if (offer.status !== OfferStatus.SENT && offer.status !== OfferStatus.COUNTERED) {
      throw new ConflictException(`Cannot accept offer with status ${offer.status}`);
    }

    offer.status = OfferStatus.ACCEPTED;
    await this.offerRepository.save(offer);

    // 매칭 생성
    const match = this.matchRepository.create({
      offerId: offer.id,
      campaignId: offer.campaignId,
      advertiserId: offer.advertiserId,
      modelId: offer.modelId,
      status: MatchStatus.IN_PROGRESS,
    });
    return await this.matchRepository.save(match);
  }

  async reject(id: string, modelId: string, rejectOfferDto: RejectOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);
    if (offer.modelId !== modelId) {
      throw new ForbiddenException('You do not have permission to reject this offer');
    }
    if (offer.status !== OfferStatus.SENT && offer.status !== OfferStatus.COUNTERED) {
      throw new ConflictException(`Cannot reject offer with status ${offer.status}`);
    }

    offer.status = OfferStatus.REJECTED;
    offer.rejectReason = rejectOfferDto.reason;
    return await this.offerRepository.save(offer);
  }

  async counter(id: string, modelId: string, counterOfferDto: CounterOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);
    if (offer.modelId !== modelId) {
      throw new ForbiddenException('You do not have permission to counter this offer');
    }
    if (offer.status !== OfferStatus.SENT) {
      throw new ConflictException(`Cannot counter offer with status ${offer.status}`);
    }

    offer.status = OfferStatus.COUNTERED;
    offer.counterPrice = counterOfferDto.counterPrice;
    offer.counterStartDate = new Date(counterOfferDto.counterStartDate);
    offer.counterEndDate = new Date(counterOfferDto.counterEndDate);
    offer.message = counterOfferDto.message || offer.message;
    return await this.offerRepository.save(offer);
  }

  async cancel(id: string, advertiserId: string): Promise<Offer> {
    const offer = await this.findOne(id);
    if (offer.advertiserId !== advertiserId) {
      throw new ForbiddenException('You do not have permission to cancel this offer');
    }
    if (offer.status !== OfferStatus.SENT && offer.status !== OfferStatus.COUNTERED) {
      throw new ConflictException(`Cannot cancel offer with status ${offer.status}`);
    }

    offer.status = OfferStatus.CANCELED;
    return await this.offerRepository.save(offer);
  }
}
