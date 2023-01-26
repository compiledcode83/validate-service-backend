import { Allow, IsUUID, Validate } from 'class-validator';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketIsDeletableValidator } from '../validators/ticket-is-deletable.validator';

export class DeleteTicketDto {
  @IsUUID()
  @Validate(TicketIsDeletableValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
