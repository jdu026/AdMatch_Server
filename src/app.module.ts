import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CampaignsModule } from './campaigns/campaigns.module';
import { OffersModule } from './offers/offers.module';
import { MatchesModule } from './matches/matches.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { Campaign } from './campaigns/entities/campaign.entity';
import { Offer } from './offers/entities/offer.entity';
import { Match } from './matches/entities/match.entity';
import { ModelProfile } from './models/entities/model-profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'admatch',
      entities: [Campaign, Offer, Match, ModelProfile],
      synchronize: true, // 개발 모드에서만 true
    }),
    CampaignsModule,
    OffersModule,
    MatchesModule,
    DiscoveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
