import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from '@web/ticket/ticket.service';
import { ListingController } from './listing.controller';
import { Listing } from '../../../../libs/listing/src/listing.entity';
import { ListingRepository } from './listing.repository';
import { ListingService } from './listing.service';
import { TicketExistsValidator } from '@web/ticket/validator/ticket-exists-validator';
import { TicketRepository } from '@web/ticket/ticket.repository';
import { TicketModule } from '@web/ticket/ticket.module';
import { QrService } from '@web/redeem/qr.service';
import { TicketValidator } from '@web/ticket/ticket.validator';
import { IsUserActiveListingValidator } from './validator/is-user-active-listing.validator';
import { IsTicketOnSaleValidator } from './validator/is-ticket-on-sale.validator';
import { ListingValidator } from './listing.validator';
import { UserModule } from '@web/user/user.module';
import { UserService } from '@web/user/user.service';
import { UserRepository } from '@web/user/user.repository';
import { EventExistsValidator } from '@web/event/validators/event-exists.validator';
import { EventModule } from '@web/event/event.module';
import { ListingSubscriber } from '@app/listing/listing.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, TicketRepository, ListingRepository]),
    TicketModule,
    UserModule,
    EventModule,
  ],
  controllers: [ListingController],
  providers: [
    ListingService,
    ListingRepository,
    TicketService,
    TicketExistsValidator,
    TicketRepository,
    QrService,
    TicketValidator,
    IsUserActiveListingValidator,
    ListingValidator,
    UserService,
    UserRepository,
    IsTicketOnSaleValidator,
    EventExistsValidator,
    ListingSubscriber,
  ],
  exports: [ListingService],
})
export class ListingModule {}
