import { ListingStatus } from '@app/listing/listing.types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingRepository } from './listing.repository';

@Injectable()
export class ListingValidator {
  constructor(
    @InjectRepository(ListingRepository)
    private readonly listingRepository: ListingRepository,
  ) {}

  async isUserActiveListing(listingUuid: string, userId: number) {
    const listing = await this.listingRepository.findOne({
      where: { uuid: listingUuid, userId: userId, status: ListingStatus.Active },
    });

    return Boolean(listing);
  }
}
