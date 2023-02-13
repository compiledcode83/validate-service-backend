import { Event } from './event.entity';

export class EventHelper {
  static getTicketsInformation(event: Event) {
    const result = {
      primary: {
        startingPrice: {
          amount: null,
          currency: null,
        },
      },
      secondary: {
        startingPrice: {
          amount: null,
          currency: null,
        },
      },
    };

    if (event?.ticketTypes?.length > 0) {
      let lowestPrice: string;

      for (const ticketType of event.ticketTypes) {
        if (!ticketType.saleEnabled) {
          continue;
        }

        if (lowestPrice && Number(ticketType.salePrice) > Number(lowestPrice)) {
          continue;
        }

        result.primary.startingPrice.amount = lowestPrice = ticketType.salePrice;
        result.primary.startingPrice.currency = ticketType.saleCurrency;
      }
    }

    return result;
  }
}
