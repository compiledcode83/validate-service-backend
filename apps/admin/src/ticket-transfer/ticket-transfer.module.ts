import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from '@admin/ticket/ticket.module';
import { TicketTransferService } from './ticket-transfer.service';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketTransferController } from './ticket-transfer.controller';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketTransfer]), TicketModule],
  providers: [TicketTransferService, TicketTransferRepository],
  controllers: [TicketTransferController],
  exports: [TicketTransferService],
})
export class TicketTransferModule {}
