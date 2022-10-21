import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { UserModule } from '@src/user/user.module';
import { TicketUserExistsAndActiveValidator } from './validators/ticket-user-exists-validator';
import { TicketIsValidatableValidator } from './validators/ticket-is-validatable.validator';
import { ProducerModule } from '@src/producer/producer.module';
import { TicketProviderEncryptionKeyModule } from '@src/ticket-provider-encryption-key/ticket-provider-encryption-key.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), UserModule, ProducerModule, TicketProviderEncryptionKeyModule],
  providers: [TicketService, TicketRepository, TicketUserExistsAndActiveValidator, TicketIsValidatableValidator],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
