import { Module } from '@nestjs/common';
import { ListingRepository } from './listing.repository';

@Module({
  providers: [ListingRepository],
})
export class ListingModule {}
