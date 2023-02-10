import { Translation } from './translation.entity';

export enum Locale {
  en_US = 'en_US',
  pt_BR = 'pt_BR',
}

export enum EntityName {
  Event = 'event',
  TicketType = 'ticketType',
}

export interface Translatable {
  translations: Translation[];
}

export class EntityAttribute {
  name: string;
  value: string;
}
