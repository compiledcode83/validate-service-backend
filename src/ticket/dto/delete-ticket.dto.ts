import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsUUID, Validate } from 'class-validator';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { TicketIsDeletableValidator } from '../validators/ticket-is-deletable.validator';

export class DeleteTicketDto {
  @ApiProperty({ example: '8e9c3708-25d8-467f-9a68-00507f8ece4a', required: true })
  @IsUUID()
  @Validate(TicketIsDeletableValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
