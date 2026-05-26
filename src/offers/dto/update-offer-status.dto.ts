import { IsIn } from 'class-validator';
import type { OfferStatus } from '../entities/offer.entity';

export class UpdateOfferStatusDto {
  @IsIn(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'])
  status: OfferStatus;
}
