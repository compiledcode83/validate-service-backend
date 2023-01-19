export interface EncryptedData {
  iv: string;
  content: string;
  version: number;
}

export const SECRET_KEY_LENGTH = 32;
