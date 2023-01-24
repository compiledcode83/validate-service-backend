import { AppDataSource } from '@app/common/configs/datasource';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { Listing } from '@app/listing/listing.entity';
import { ListingStatus } from '@app/listing/listing.types';
import { DateTime } from 'luxon';

export class ListingFactory {
  static async create(data?: Partial<Listing>) {
    const listing = new Listing();
    listing.userId = data.userId;
    listing.ticketId = data.ticketId;
    listing.buyNowPrice = `${Math.floor(Math.random() * 100)}`;
    listing.buyNowCurrency = CurrencyEnum.USD;
    listing.marketType = data.marketType ? data.marketType : 'secondary';
    listing.status = data.status ? data.status : ListingStatus.Active;
    listing.endsAt = DateTime.now().plus({ days: 1 }).toJSDate();
    listing.eventId = data.eventId ? data.eventId : Math.floor(Math.random() * 1);

    return AppDataSource.manager.getRepository(Listing).save({ ...listing });
  }
}
