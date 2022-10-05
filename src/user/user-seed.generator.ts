import { randomBytes } from 'node:crypto';

export class UserSeedGenerator {
  static generate(length: number): string {
    return randomBytes(length / 2)
      .toString('hex')
      .substring(0, length);
  }
}
