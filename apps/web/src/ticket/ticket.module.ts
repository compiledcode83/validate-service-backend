import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketRepository } from './ticket.repository';
import { UserModule } from '@web/user/user.module';
import { QrService } from '@web/redeem/qr.service';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketSubscriber } from '@app/ticket/ticket.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), UserModule],
  providers: [TicketService, TicketRepository, QrService, TicketSubscriber],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
