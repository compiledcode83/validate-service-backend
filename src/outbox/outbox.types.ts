import { EventEventPattern } from '@src/event/event.types';
import { EventCreateMessage } from '@src/event/messages/event-create.message';
import { EventUpdateMessage } from '@src/event/messages/event-update.message';
import { TicketTransferMessage } from '@src/ticket-transfer/messages/ticket-transfer.message';
import { TicketTransferEventPattern } from '@src/ticket-transfer/ticket-transfer.types';
import { TicketTypeCreateMessage } from '@src/ticket-type/messages/ticket-type-create.message';
import { TicketTypeUpdateMessage } from '@src/ticket-type/messages/ticket-type-update.message';
import { TicketTypeEventPattern } from '@src/ticket-type/ticket-type.types';
import { TicketCreateMessage } from '@src/ticket/messages/ticket-create.message';
import { TicketDeleteMessage } from '@src/ticket/messages/ticket-delete.message';
import { TicketValidateMessage } from '@src/ticket/messages/ticket-validate.message';
import { TicketEventPattern } from '@src/ticket/ticket.types';
import { UserCreateMessage } from '@src/user/messages/user-create.message';
import { UserEventPattern } from '@src/user/user.types';

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
