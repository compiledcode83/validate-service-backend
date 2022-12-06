import { TicketTransferMessage } from '@src/ticket-transfer/messages/ticket-transfer.message';
import { TicketTransferEventPattern } from '@src/ticket-transfer/ticket-transfer.types';
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

export type OutboxEventName = TicketEventPattern | TicketTransferEventPattern | UserEventPattern;
export type OutboxPayload =
  | TicketCreateMessage
  | TicketDeleteMessage
  | TicketValidateMessage
  | UserCreateMessage
  | TicketTransferMessage;
