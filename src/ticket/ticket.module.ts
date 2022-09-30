import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { UserModule } from '@src/user/user.module';
import { TicketUserExistsValidator } from './validators/ticket-user-exists-validator';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), UserModule],
  providers: [TicketService, TicketRepository, TicketUserExistsValidator],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
