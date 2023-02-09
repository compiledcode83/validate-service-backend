import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from '@app/listing/listing.entity';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { ListingRepository } from './listing.repository';
import { ListingService as CommonListingService } from '@app/listing/listing.service';
import { ListingRepository as CommonListingRepository } from '@app/listing/listing.repository';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Listing]), UserModule],
  controllers: [ListingController],
  providers: [ListingService, ListingRepository, CommonListingService, CommonListingRepository],
  exports: [ListingService],
})
export class ListingModule {}
