export enum UserStatus {
  Creating = 'creating',
  Active = 'active',
}

export const SEED_PHRASE_LENGTH = 64;

export interface WalletCreateMessage {
  operationUuid: string;
  userUuid: string;
}
