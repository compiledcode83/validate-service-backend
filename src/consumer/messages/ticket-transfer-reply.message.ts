import { TicketTransfer } from '@src/ticket-transfer/ticket-transfer.entity';

export class TicketTransferReplyMessage {
  transfer: TicketTransfer;
  errorData?: string;
}
