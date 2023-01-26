import { DATE_FORMAT } from '@app/ticket-type/ticket-type.types';
import { DateTime } from 'luxon';
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

  static getEventDates(event: Event) {
    const result = {
      dateStart: null,
      dateEnd: null,
    };

    if (event?.ticketTypes?.length > 0) {
      let lowestStartDate: string;
      let highestEndDate: string;

      for (const ticketType of event.ticketTypes) {
        if (!ticketType.saleEnabled) {
          continue;
        }

        if (!ticketType?.ticketDateStart || !ticketType?.ticketDateEnd) {
          continue;
        }

        if (
          !lowestStartDate ||
          DateTime.fromISO(lowestStartDate) > DateTime.fromISO(ticketType.ticketDateStart as any)
        ) {
          result.dateStart = lowestStartDate = DateTime.fromISO(ticketType.ticketDateStart as any).toFormat(
            DATE_FORMAT,
          );
        }

        if (!highestEndDate || DateTime.fromISO(highestEndDate) < DateTime.fromISO(ticketType.ticketDateEnd as any)) {
          result.dateEnd = highestEndDate = DateTime.fromISO(ticketType.ticketDateEnd as any).toFormat(DATE_FORMAT);
        }
      }
    }

    return result;
  }
}
