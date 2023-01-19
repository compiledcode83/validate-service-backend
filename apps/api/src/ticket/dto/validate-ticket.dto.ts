import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString, Validate } from 'class-validator';
import { TicketIsValidatableValidator } from '../validators/ticket-is-validatable.validator';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';

export class ValidateTicketDto {
  @ApiProperty({ example: '8e9c3708-25d8-467f-9a68-00507f8ece4a', required: true })
  @IsString()
  @Validate(TicketIsValidatableValidator)
  hash: string;

  @Allow()
  ticketProvider: TicketProvider;

  @Allow()
  ticketUuid: string;
}
