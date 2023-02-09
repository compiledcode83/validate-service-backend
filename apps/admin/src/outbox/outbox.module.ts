import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outbox } from '@app/outbox/outbox.entity';
import { OutboxController } from './outbox.controller';
import { OutboxService } from './outbox.service';
import { OutboxRepository } from './outbox.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Outbox])],
  controllers: [OutboxController],
  providers: [OutboxService, OutboxRepository],
  exports: [OutboxService],
})
export class OutboxModule {}
