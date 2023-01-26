import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsNotEmpty, IsPhoneNumber, IsUUID, Validate } from 'class-validator';
import { IncomingHttpHeaders } from 'node:http';
import { HeadersValidator } from '../validators/headers.validator';
import { TicketProviderExistsValidator } from '../validators/ticket-provider-exists.validator';

export class SendAuthCodeDto {
  @ApiProperty({ example: '+19071111111' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ example: '8e9c3708-25d8-467f-9a68-00507f8ece4a', required: true })
  @IsUUID()
  @Validate(TicketProviderExistsValidator)
  ticketProviderUuid: string;

  @Validate(HeadersValidator)
  headers: IncomingHttpHeaders;

  @IsIP()
  ip: string;

  ticketProviderId: number;
}
