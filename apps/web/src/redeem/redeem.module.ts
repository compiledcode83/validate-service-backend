import { Module } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemController } from './redeem.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedeemRepository } from './redeem.repository';
import { TicketModule } from '@web/ticket/ticket.module';
import { AtLeastOneTicketRedeemableValidator } from './validators/at-least-one-ticket-redeemable.validator';
import { TicketIsInRedeemingProcess } from './validators/ticket-is-in-redeeming-process.validator';
import { RedeemCodeValidator } from './validators/redeem-code.validator';
import { QrService } from './qr.service';
import { RedeemIsActiveValidator } from './validators/redeem-is-active.validator';
import { MessageModule } from '@web/message/message.module';
import { Redeem } from '@app/redeem/redeem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Redeem]), TicketModule, MessageModule],
  providers: [
    RedeemService,
    RedeemRepository,
    AtLeastOneTicketRedeemableValidator,
    TicketIsInRedeemingProcess,
    RedeemCodeValidator,
    QrService,
    RedeemIsActiveValidator,
  ],
  controllers: [RedeemController],
  exports: [RedeemService],
})
export class RedeemModule {}
