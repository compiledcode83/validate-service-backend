import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentProviderType } from '../payment.types';

export class WebhookDto {
  @ApiProperty({ example: PaymentProviderType.Stripe, required: true })
  @IsEnum(PaymentProviderType)
  paymentProviderType: PaymentProviderType;
}
