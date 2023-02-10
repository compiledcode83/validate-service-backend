import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, Allow, IsOptional } from 'class-validator';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';

export class CreateTicketEventDto {
  @ApiProperty({
    example: '8e9c3708-25d8-467f-9a68-00507f8ece4a',
    required: true,
    description: 'Uuid of event',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  eventUuid: string;

  @ApiProperty({
    example: 'John Doe Concert',
    required: true,
    description: 'Name of the event',
  })
  @IsString()
  @IsOptional()
  name: string;

  @Allow()
  ticketProvider: TicketProvider;
}
