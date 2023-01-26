import { OrderService } from '@web/order/order.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@ValidatorConstraint({ name: 'orderIsPayableValidator', async: true })
export class OrderIsPayableValidator implements ValidatorConstraintInterface {
  constructor(private readonly orderService: OrderService) {}

  async validate(orderUuid: string, args: ValidationArguments): Promise<boolean> {
    const { user } = args.object as CreatePaymentDto;
    const order = await this.orderService.findPayableOrder(orderUuid, user.id);

    return order !== null;
  }

  defaultMessage() {
    return 'Order not found or is not payable';
  }
}
