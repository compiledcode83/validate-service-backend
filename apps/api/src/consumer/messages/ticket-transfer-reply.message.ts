import { TicketTransfer } from '@api/ticket-transfer/ticket-transfer.entity';

export class TicketTransferReplyMessage {
  transfer: TicketTransfer;
  errorData?: string;

  constructor(data: Partial<TicketTransferReplyMessage>) {
    Object.assign(this, data);
  }
}
