import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/user/user.entity';
import { Allow, IsEnum, IsUUID, Validate } from 'class-validator';
import { PaymentProviderType } from '../payment.types';
import { OrderIsPayableValidator } from '../validators/order-is-payable.validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000', required: true })
  @IsUUID()
  @Validate(OrderIsPayableValidator)
  orderUuid: string;

  @ApiProperty({ example: PaymentProviderType.Stripe, required: true })
  @IsEnum(PaymentProviderType)
  paymentProviderType: PaymentProviderType;

  @Allow()
  user?: User;
}
