import { RedisService } from '@src/redis/redis.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';
import { TicketService } from '../ticket.service';
import { TicketStatus } from '../ticket.types';

@ValidatorConstraint({ name: 'ticketIsValidatableValidator', async: true })
export class TicketIsValidatableValidator implements ValidatorConstraintInterface {
  private errorMessage: string;

  constructor(private readonly ticketService: TicketService, private readonly redisService: RedisService) {}

  async validate(hash: string, args: ValidationArguments): Promise<boolean> {
    const ticketUuid = await this.redisService.get(hash);

    if (!ticketUuid) {
      this.errorMessage = `Hash value was not found`;

      return false;
    }

    const { ticketProvider } = args.object as ValidateTicketDto;
    const ticket = await this.ticketService.findByUuidAndProvider(ticketUuid, ticketProvider.id);

    if (!ticket || ticket.status !== TicketStatus.Active) {
      this.errorMessage = `Ticket is already used or not created yet`;

      return false;
    }

    (args.object as ValidateTicketDto).ticketUuid = ticketUuid;

    return true;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
