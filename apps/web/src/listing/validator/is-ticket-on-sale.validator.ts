import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ListingService } from '../listing.service';
import { TicketService } from '@web/ticket/ticket.service';

@ValidatorConstraint({ name: 'isTicketOnSaleValidator', async: true })
export class IsTicketOnSaleValidator implements ValidatorConstraintInterface {
  constructor(private readonly listingService: ListingService, private readonly ticketService: TicketService) {}

  async validate(ticketUuid: any): Promise<boolean> {
    const ticket = await this.ticketService.findByUuid(ticketUuid);
    if (ticket) {
      const ticketInListing = await this.listingService.findByTicketId(ticket.id);

      return ticketInListing === null;
    }

    return false;
  }

  defaultMessage(): string {
    return 'Ticket is Already on sale';
  }
}
