import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsString()
  @IsNotEmpty()
  modelId: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  scope?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class CounterOfferDto {
  @IsNumber()
  @IsNotEmpty()
  counterPrice: number;

  @IsDateString()
  @IsNotEmpty()
  counterStartDate: string;

  @IsDateString()
  @IsNotEmpty()
  counterEndDate: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class RejectOfferDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
