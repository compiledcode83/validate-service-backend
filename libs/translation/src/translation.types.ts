import { Translation } from './translation.entity';

export enum Locale {
  en_US = 'en-US',
  pt_BR = 'pt-BR',
}

export enum EntityName {
  Event = 'Event',
  TicketType = 'TicketType',
}

export interface Translatable {
  translations: Translation[];
}

export class EntityAttribute {
  name: string;
  value: string;
}
