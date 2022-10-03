import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Allow, IsUUID, Validate } from 'class-validator';
import { TicketExistsValidator } from '../validators/ticket-exists-validator';
import { TicketUserExistsValidator } from '../../ticket/validators/ticket-user-exists-validator';

export class CreateTicketTransferDto {
  @ApiProperty({
    example: '5e9d96f9-7103-4b8b-b3c6-c37608e38305',
    required: true,
    description: `New ticket owner uuid`,
  })
  @IsUUID()
  @Validate(TicketUserExistsValidator)
  userUuid: string;

  @ApiProperty({
    example: '5e9d96f9-7103-4b8b-b3c6-c37608e38305',
    required: true,
    description: `Ticket uuid`,
  })
  @IsUUID()
  @Validate(TicketExistsValidator)
  ticketUuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
