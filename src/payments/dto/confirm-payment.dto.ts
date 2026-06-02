import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class ConfirmPaymentDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{13,19}$/)
  cardNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 64)
  cardHolderName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
  expiry?: string; // MM/YY

  @IsOptional()
  @IsString()
  @Matches(/^\d{3,4}$/)
  cvc?: string;
}

