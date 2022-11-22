import { BadRequestException, Injectable } from '@nestjs/common';
import { Ticket } from '@src/ticket/ticket.entity';
import { DataSource, Repository } from 'typeorm';
import { TicketTransfer } from './ticket-transfer.entity';
import { TicketTransferStatus } from './ticket-transfer.types';

@Injectable()
export class TicketTransferRepository extends Repository<TicketTransfer> {
  constructor(private readonly dataSource: DataSource) {
    super(TicketTransfer, dataSource.manager);
  }

  async complete(uuid: string, transactionHash: string): Promise<TicketTransfer> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ticketTransfer = await queryRunner.manager
        .createQueryBuilder(TicketTransfer, 'ticket_transfer')
        .setLock('pessimistic_write')
        .where({ uuid })
        .getOne();

      const ticket = await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .setLock('pessimistic_write')
        .where({ id: ticketTransfer.id })
        .getOne();

      if (!ticketTransfer || !ticket) {
        throw new BadRequestException('Ticket or ticket transfer is not found');
      }

      await queryRunner.manager
        .createQueryBuilder(TicketTransfer, 'ticket_transfer')
        .update(TicketTransfer)
        .where({ uuid })
        .set({ status: TicketTransferStatus.Completed, transactionHash, finishedAt: new Date(), errorData: null })
        .execute();

      await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .update(Ticket)
        .where({ id: ticket.id })
        .set({ userId: ticketTransfer.userIdTo })
        .execute();

      await queryRunner.commitTransaction();

      return this.findOne({ where: { uuid } });
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
