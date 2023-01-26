import { Event } from '@app/event/event.entity';
import { TicketStatus } from '@app/ticket/ticket.types';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '@app/ticket/ticket.entity';

class TicketRedeemEvent {
  @ApiProperty({ description: `Event uuid`, maximum: 36 })
  uuid: string;

  @ApiProperty({
    description: 'Name of the event',
    example: 'Fifa World Cup 2022',
    maximum: 255,
    minimum: 1,
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'Lorem ipsum',
    maximum: 10000,
    minimum: 1,
    required: false,
  })
  description: string;

  constructor(event: Event) {
    this.uuid = event.uuid;
    this.name = event.name;
    this.description = event.description;
  }
}

class TicketRedeemTicketType {
  @ApiProperty({ description: `Ticket type uuid`, maximum: 36 })
  uuid: string;

  @ApiProperty({
    description: 'Name of the ticket type',
    example: 'VIP ticket',
    maximum: 255,
    minimum: 1,
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Description of the ticket type',
    example: 'Premium feeling',
    maximum: 255,
    minimum: 1,
    required: true,
  })
  description: string;

  @ApiProperty({ description: 'Ticket date start', example: '2023-02-01', required: true })
  ticketDateStart: Date;

  @ApiProperty({ description: 'Ticket date end', example: '2023-02-03', required: false })
  ticketDateEnd: Date;

  @ApiProperty({ type: TicketRedeemEvent })
  event: TicketRedeemEvent;

  constructor(ticketType: TicketType) {
    this.uuid = ticketType.uuid;
    this.name = ticketType.name;
    this.description = ticketType.description;
    this.ticketDateStart = ticketType.ticketDateStart;
    this.ticketDateEnd = ticketType.ticketDateEnd;
    this.event = new TicketRedeemEvent(ticketType.event);
  }
}

export class TicketRedeemDto {
  @ApiProperty({ example: 'cbc0bd0b-cbce-4922-91c1-9e2ea5e4eff9', description: `Ticket's unique uuid`, maximum: 36 })
  uuid: string;

  @ApiProperty({
    example: '91c1-9e2ea5e4eff9',
    description: `Ticket's hash for using in URL`,
    maximum: 36,
  })
  hash: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image of the ticket',
    maximum: 255,
    required: false,
  })
  imageUrl: string;

  @ApiProperty({ description: 'Ticket status', example: TicketStatus.Creating, required: true })
  status: TicketStatus;

  @ApiProperty({ description: 'Tickets purchase id', example: 'cbc0bd0b-cbce-4922-91c1-9e2ea5e4eff9', required: true })
  purchaseId: string;

  @ApiProperty({ type: TicketRedeemTicketType })
  ticketType: TicketRedeemTicketType;

  constructor(ticket: Ticket) {
    this.uuid = ticket.uuid;
    this.hash = ticket.hash;
    this.imageUrl = ticket.imageUrl;
    this.status = ticket.status;
    this.purchaseId = ticket.purchaseId;
    this.ticketType = new TicketRedeemTicketType(ticket.ticketType);
  }
}
