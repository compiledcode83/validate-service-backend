import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Listing } from '@app/listing/listing.entity';
import { FindListingDto } from './dto/find-listing.dto';
import { ListingRepository } from './listing.repository';
import { ListingStatus } from '@app/listing/listing.types';

@Injectable()
export class ListingService {
  constructor(private readonly listingRepository: ListingRepository) {}

  async findAllPaginated(searchParams: FindListingDto): Promise<PaginatedResult<Listing>> {
    return this.listingRepository.getPaginatedQueryBuilder(searchParams);
  }

  async cancelListing(id: number) {
    await this.listingRepository.update({ id }, { status: ListingStatus.Canceled });

    return this.findById(id);
  }

  async findById(id: number) {
    this.listingRepository.findOne({ where: { id } });
  }
}
