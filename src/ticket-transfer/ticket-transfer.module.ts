import { Module } from '@nestjs/common';
import { TicketTransferService } from './ticket-transfer.service';
import { TicketTransferController } from './ticket-transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTransfer } from './ticket-transfer.entity';
import { UserModule } from '@src/user/user.module';
import { TicketModule } from '@src/ticket/ticket.module';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketExistsValidator } from './validators/ticket-exists-validator';
import { ProducerModule } from '@src/producer/producer.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketTransfer]), UserModule, TicketModule, ProducerModule],
  providers: [TicketTransferService, TicketTransferRepository, TicketExistsValidator],
  controllers: [TicketTransferController],
  exports: [TicketTransferService],
})
export class TicketTransferModule {}
