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

export enum OutboxStatus {
  Created = 'created',
  Sent = 'sent',
}

export type OutboxEventName =
  | TicketEventPattern
  | TicketTransferEventPattern
  | UserEventPattern
  | EventEventPattern
  | TicketTypeEventPattern;

export type OutboxPayload =
  | TicketCreateMessage
  | TicketDeleteMessage
  | TicketValidateMessage
  | UserCreateMessage
  | TicketTransferMessage
  | EventCreateMessage
  | EventUpdateMessage
  | TicketTypeCreateMessage
  | TicketTypeUpdateMessage;
