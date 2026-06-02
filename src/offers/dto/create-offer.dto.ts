import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  campaignId: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  price: string;
}
