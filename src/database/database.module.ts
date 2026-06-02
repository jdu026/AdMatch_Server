import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { OfferEntity } from '../offers/entities/offer.entity';
import { ModelProfileEntity } from '../profiles/entities/model-profile.entity';
import { User } from '../user/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ModelProfileEntity,
      CampaignEntity,
      OfferEntity,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
