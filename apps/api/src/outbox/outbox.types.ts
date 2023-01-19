import { EventEventPattern } from '@api/event/event.types';
import { EventCreateMessage } from '@api/event/messages/event-create.message';
import { EventUpdateMessage } from '@api/event/messages/event-update.message';
import { TicketTransferMessage } from '@api/ticket-transfer/messages/ticket-transfer.message';
import { TicketTransferEventPattern } from '@api/ticket-transfer/ticket-transfer.types';
import { TicketTypeCreateMessage } from '@api/ticket-type/messages/ticket-type-create.message';
import { TicketTypeUpdateMessage } from '@api/ticket-type/messages/ticket-type-update.message';
import { TicketTypeEventPattern } from '@api/ticket-type/ticket-type.types';
import { TicketCreateMessage } from '@api/ticket/messages/ticket-create.message';
import { TicketDeleteMessage } from '@api/ticket/messages/ticket-delete.message';
import { TicketValidateMessage } from '@api/ticket/messages/ticket-validate.message';
import { TicketEventPattern } from '@api/ticket/ticket.types';
import { UserCreateMessage } from '@api/user/messages/user-create.message';
import { UserEventPattern } from '@api/user/user.types';

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
