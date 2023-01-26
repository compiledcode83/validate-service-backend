import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbox } from './inbox.entity';
import { InboxService } from './inbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inbox])],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}
