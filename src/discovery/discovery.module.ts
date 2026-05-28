import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryService } from './discovery.service';
import { DiscoveryController } from './discovery.controller';
import { ModelProfile } from '../models/entities/model-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelProfile])],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule { }
