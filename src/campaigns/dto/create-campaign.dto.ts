import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  brand: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  budget: string;

  @IsString()
  @MinLength(1)
  requirements: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsString()
  contentStyle?: string;

  @IsOptional()
  @IsString()
  brandGuidelines?: string;

  @IsOptional()
  @IsString()
  productDetails?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  type?: string;
}
