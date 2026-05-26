import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import type { CreatePaymentDto } from './dto/create-payment.dto';
import type { Payment, PaymentFailureCode, PaymentScenario, PaymentStatus } from './payments.types';

function nowIso() {
  return new Date().toISOString();
}

function last4(cardNumber?: string) {
  if (!cardNumber) return undefined;
  return cardNumber.slice(-4);
}

function pickFailure(cardNumber?: string): { code: PaymentFailureCode; message: string } {
  // Deterministic-ish mapping for demo/testing.
  const n = cardNumber ?? '';
  if (n.endsWith('0000')) return { code: 'card_declined', message: '카드가 거절되었습니다.' };
  if (n.endsWith('1111')) return { code: 'insufficient_funds', message: '잔액이 부족합니다.' };
  if (n.endsWith('2222')) return { code: 'expired_card', message: '만료된 카드입니다.' };
  if (n.length > 0 && n.length < 13) return { code: 'invalid_number', message: '카드 번호가 올바르지 않습니다.' };
  return { code: 'processing_error', message: '결제 처리 중 오류가 발생했습니다.' };
}

function computeFinalStatus(
  scenario: PaymentScenario,
  cardNumber?: string,
): { status: PaymentStatus; failure?: { code: PaymentFailureCode; message: string } } {
  if (scenario === 'pending') return { status: 'PROCESSING' };
  if (scenario === 'force_success') return { status: 'SUCCEEDED' };
  if (scenario === 'force_fail') return { status: 'FAILED', failure: pickFailure(cardNumber) };

  // auto
  if (cardNumber && (cardNumber.endsWith('0000') || cardNumber.endsWith('1111') || cardNumber.endsWith('2222')))
    return { status: 'FAILED', failure: pickFailure(cardNumber) };
  return { status: 'SUCCEEDED' };
}

@Injectable()
export class PaymentsService {
  private readonly payments = new Map<string, Payment>();

  create(dto: CreatePaymentDto) {
    const id = randomUUID();
    const createdAt = nowIso();
    const scenario: PaymentScenario = dto.scenario ?? 'auto';

    const payment: Payment = {
      id,
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency,
      status: 'CREATED',
      createdAt,
      updatedAt: createdAt,
      scenario,
    };

    this.payments.set(id, payment);

    return {
      paymentId: id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      orderId: payment.orderId,
      // "결제 SDK" 흉내용
      clientSecret: `mock_secret_${id}`,
    };
  }

  get(id: string) {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundException('payment_not_found');
    return payment;
  }

  confirm(id: string, dto: ConfirmPaymentDto) {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundException('payment_not_found');
    if (payment.status === 'SUCCEEDED') return payment;
    if (payment.status === 'FAILED') return payment;

    const scenario: PaymentScenario = payment.scenario ?? 'auto';
    const final = computeFinalStatus(scenario, dto.cardNumber);

    const updated: Payment = {
      ...payment,
      status: final.status,
      updatedAt: nowIso(),
      cardLast4: last4(dto.cardNumber),
      failureCode: final.failure?.code,
      failureMessage: final.failure?.message,
    };

    this.payments.set(id, updated);
    return updated;
  }

  markSucceeded(id: string) {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundException('payment_not_found');
    if (payment.status !== 'PROCESSING' && payment.status !== 'CREATED') {
      throw new BadRequestException('payment_not_in_processable_state');
    }
    const updated: Payment = { ...payment, status: 'SUCCEEDED', updatedAt: nowIso(), failureCode: undefined, failureMessage: undefined };
    this.payments.set(id, updated);
    return updated;
  }

  markFailed(id: string, failureCode?: PaymentFailureCode, failureMessage?: string) {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundException('payment_not_found');
    if (payment.status !== 'PROCESSING' && payment.status !== 'CREATED') {
      throw new BadRequestException('payment_not_in_processable_state');
    }
    const fallback = pickFailure();
    const updated: Payment = {
      ...payment,
      status: 'FAILED',
      updatedAt: nowIso(),
      failureCode: failureCode ?? fallback.code,
      failureMessage: failureMessage ?? fallback.message,
    };
    this.payments.set(id, updated);
    return updated;
  }
}

