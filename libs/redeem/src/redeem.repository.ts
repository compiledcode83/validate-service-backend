import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Redeem } from './redeem.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedeemRepository extends Repository<Redeem> {
  constructor(public readonly dataSource: DataSource, private readonly configService: ConfigService) {
    super(Redeem, dataSource.manager);
  }
}
