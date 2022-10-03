import { AppDataSource } from '@src/config/datasource';
import { TicketTransfer } from '@src/ticket-transfer/ticket-transfer.entity';
import { TicketTransferStatus } from '@src/ticket-transfer/ticket-transfer.types';

export class TicketTransferFactory {
  static async create(data?: Partial<TicketTransfer>) {
    const ticketTransfer = new TicketTransfer();
    ticketTransfer.status = TicketTransferStatus.InProgress;

    return AppDataSource.manager.getRepository(TicketTransfer).save({ ...ticketTransfer, ...data });
  }
}
