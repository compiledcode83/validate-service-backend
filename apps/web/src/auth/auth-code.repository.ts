import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { AuthCode } from './auth-code.entity';

@Injectable()
export class AuthCodeRepository extends Repository<AuthCode> {
  constructor(private readonly dataSource: DataSource) {
    super(AuthCode, dataSource.manager);
  }

  async findAuthCode(userId: number, phoneNumber: string, authCode: number) {
    return this.createQueryBuilder('authCode')
      .where('authCode.phoneNumber = :phoneNumber', { phoneNumber })
      .andWhere('authCode.code = :authCode', { authCode })
      .andWhere('authCode.userId = :userId', { userId })
      .andWhere('authCode.expireAt >= :date', { date: DateTime.now().toJSDate() })
      .andWhere('authCode.usedAt IS NULL')
      .getOne();
  }
}
