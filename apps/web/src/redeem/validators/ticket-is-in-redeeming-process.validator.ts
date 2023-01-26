import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RedeemService } from '../redeem.service';
import { TicketService } from '@web/ticket/ticket.service';

@ValidatorConstraint({ name: 'ticketIsInRedeemingProcess', async: true })
export class TicketIsInRedeemingProcess implements ValidatorConstraintInterface {
  constructor(private readonly redeemService: RedeemService, private readonly ticketService: TicketService) {}

  async validate(ticketUuid: string): Promise<boolean> {
    const ticket = await this.ticketService.findByUuid(ticketUuid);
    const redeem = await this.redeemService.getActivePurchaseRedeem(ticket.purchaseId);

    return redeem === null;
  }

  defaultMessage(): string {
    return 'Ticket is in redeeming process';
  }
}
