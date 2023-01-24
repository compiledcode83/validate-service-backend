import { DataSource, Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListingRepository extends Repository<Listing> {
  constructor(private readonly dataSource: DataSource) {
    super(Listing, dataSource.manager);
  }
}
