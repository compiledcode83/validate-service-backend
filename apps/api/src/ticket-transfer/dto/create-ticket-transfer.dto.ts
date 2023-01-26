import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Allow, IsUUID, Validate } from 'class-validator';
import { TicketExistsAndActiveValidator } from '../validators/ticket-exists-and-active.validator';
import { TicketTransferReceiverValidator } from '../validators/ticket-transfer-receiver.validator';
import { TicketUserExistsAndActiveValidator } from '@api/ticket/validators/ticket-user-exists-and-active.validator';

export class CreateTicketTransferDto {
  @ApiProperty({
    example: '5e9d96f9-7103-4b8b-b3c6-c37608e38305',
    required: true,
    description: `New ticket owner uuid`,
  })
  @IsUUID()
  @Validate(TicketUserExistsAndActiveValidator)
  @Validate(TicketTransferReceiverValidator)
  userUuid: string;

  @ApiProperty({
    example: '5e9d96f9-7103-4b8b-b3c6-c37608e38305',
    required: true,
    description: `Ticket uuid`,
  })
  @IsUUID()
  @Validate(TicketExistsAndActiveValidator)
  ticketUuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
