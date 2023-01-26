import { Injectable } from '@nestjs/common';
import { ListingRepository } from './listing.repository';
import { ListingDto } from './dto/listing.filter.dto';
import { ListingCreateValidateDto } from './dto/listing.create.dto';
import { UserRepository } from '@web/user/user.repository';
import { TicketService } from '@web/ticket/ticket.service';
import { ListingStatus } from '@app/listing/listing.types';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketService: TicketService,
  ) {}

  async findAllPaginated(searchParams: ListingDto) {
    return this.listingRepo.getPaginatedQueryBuilder(searchParams);
  }

  async createListing(data: ListingCreateValidateDto, userId: number) {
    const ticket = await this.ticketService.findByUuid(data.ticketUuid);

    const { eventId } = ticket;

    return this.listingRepo.save({ ...data, eventId, userId, ticketId: ticket.id });
  }

  async cancel(listingUuid: string, userUuid: string) {
    const user = await this.userRepository.findOne({ where: { uuid: userUuid } });

    return this.listingRepo.update({ uuid: listingUuid, userId: user.id }, { status: ListingStatus.Canceled });
  }

  async findByTicketId(ticketId: number) {
    return this.listingRepo.findOne({ where: { ticketId, status: ListingStatus.Active } });
  }
}
