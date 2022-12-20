import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { UserModule } from '@src/user/user.module';
import { TicketUserExistsAndActiveValidator } from './validators/ticket-user-exists-and-active.validator';
import { TicketIsValidatableValidator } from './validators/ticket-is-validatable.validator';
import { TicketProviderEncryptionKeyModule } from '@src/ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketIsDeletableValidator } from './validators/ticket-is-deletable.validator';
import { EventModule } from '@src/event/event.module';
import { RedisModule } from '@src/redis/redis.module';
import { OutboxModule } from '@src/outbox/outbox.module';
import { TicketTypeModule } from '@src/ticket-type/ticket-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    UserModule,
    TicketProviderEncryptionKeyModule,
    EventModule,
    RedisModule,
    OutboxModule,
    TicketTypeModule,
  ],
  providers: [
    TicketService,
    TicketRepository,
    TicketUserExistsAndActiveValidator,
    TicketIsValidatableValidator,
    TicketIsDeletableValidator,
  ],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
