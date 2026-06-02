import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { PaymentScenario } from '../payments.types';

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsInt()
  @Min(1)
  @Max(1000000000)
  amount!: number;

  @IsIn(['KRW', 'USD'])
  currency!: 'KRW' | 'USD';

  @IsOptional()
  @IsIn(['auto', 'force_success', 'force_fail', 'pending'])
  scenario?: PaymentScenario;
}

