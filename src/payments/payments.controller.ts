import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import type { PaymentFailureCode } from './payments.types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.paymentsService.get(id);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirm(id, dto);
  }

  // "웹훅/결제사 콜백" 흉내용 엔드포인트
  @Post(':id/mock-webhook')
  mockWebhook(
    @Param('id') id: string,
    @Body()
    body: {
      event: 'payment_succeeded' | 'payment_failed';
      failureCode?: PaymentFailureCode;
      failureMessage?: string;
    },
  ) {
    if (body.event === 'payment_succeeded') return this.paymentsService.markSucceeded(id);
    return this.paymentsService.markFailed(id, body.failureCode, body.failureMessage);
  }
}

