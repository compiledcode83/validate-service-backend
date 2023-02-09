import { EventCreateMessage } from '@app/event/messages/event-create.message';
import { EventUpdateMessage } from '@app/event/messages/event-update.message';
import { TicketTransferMessage } from '@app/ticket-transfer/messages/ticket-transfer.message';
import { TicketTypeCreateMessage } from '@app/ticket-type/messages/ticket-type-create.message';
import { TicketTypeUpdateMessage } from '@app/ticket-type/messages/ticket-type-update.message';
import { TicketCreateMessage, TicketDeleteMessage, TicketEventPattern, TicketValidateMessage } from '@app/ticket';
import { TicketTransferEventPattern } from '@app/ticket-transfer';
import { TicketTypeEventPattern } from '@app/ticket-type';
import { UserEventPattern } from '@app/user';
import { UserCreateMessage } from '@app/user/messages/user-create.message';
import { EventEventPattern } from '@app/event';
import { MessageEventPattern } from '@app/message';
import { MessageSendMessage } from '@app/message/messages/message-send.message';
import { PaymentEventPattern } from '@web/payment/payment.types';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';
import { Outbox } from './outbox.entity';

export enum OutboxStatus {
  Created = 'created',
  Sent = 'sent',
}

export class OutboxPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Event })
  data: Outbox[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}

export type OutboxEventName =
  | TicketEventPattern
  | TicketTransferEventPattern
  | UserEventPattern
  | EventEventPattern
  | TicketTypeEventPattern
  | MessageEventPattern
  | PaymentEventPattern;

export type OutboxPayload =
  | TicketCreateMessage
  | TicketDeleteMessage
  | TicketValidateMessage
  | UserCreateMessage
  | TicketTransferMessage
  | EventCreateMessage
  | EventUpdateMessage
  | TicketTypeCreateMessage
  | TicketTypeUpdateMessage
  | MessageSendMessage
  | PaymentCancelPaywallMessage;
