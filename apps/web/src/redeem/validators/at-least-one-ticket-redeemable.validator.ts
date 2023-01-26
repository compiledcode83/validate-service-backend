import { ConfigService } from '@nestjs/config';
import { TicketService } from '@web/ticket/ticket.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateRedeemDto } from '../dto/create-redeem.dto';
import { RedeemService } from '../redeem.service';

@ValidatorConstraint({ name: 'atLeastOneTicketRedeemableValidator', async: true })
export class AtLeastOneTicketRedeemableValidator implements ValidatorConstraintInterface {
  private errorMessage: string;

  constructor(
    private readonly ticketService: TicketService,
    private readonly redeemService: RedeemService,
    private readonly configService: ConfigService,
  ) {}

  async validate(purchaseId: string, args: ValidationArguments): Promise<boolean> {
    const tickets = await this.ticketService.findAllRedeemableByPurchaseId(String(purchaseId));

    if (tickets.length === 0) {
      this.errorMessage = `Purchase doesn't have redeemable tickets`;

      return false;
    }

    const redeemsInLastHour = await this.redeemService.countRedeemsInLastHour(purchaseId);

    if (redeemsInLastHour >= this.configService.get('redeemConfig.redeemLimitPerHour')) {
      this.errorMessage = `Too many redeems. Please, try again later`;

      return false;
    }

    const { mode } = args.object as CreateRedeemDto;
    const activeRedeem = await this.redeemService.getActivePurchaseRedeem(purchaseId, mode);

    if (activeRedeem !== null) {
      this.errorMessage = `Purchase is already being redeemed in ${mode} mode`;

      return false;
    }

    return true;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
