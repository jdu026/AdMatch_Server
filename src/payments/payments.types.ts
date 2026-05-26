export type PaymentStatus = 'CREATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

export type PaymentScenario = 'auto' | 'force_success' | 'force_fail' | 'pending';

export type PaymentFailureCode =
  | 'card_declined'
  | 'insufficient_funds'
  | 'expired_card'
  | 'invalid_number'
  | 'processing_error';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: 'KRW' | 'USD';
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  scenario: PaymentScenario;
  cardLast4?: string;
  failureCode?: PaymentFailureCode;
  failureMessage?: string;
}

