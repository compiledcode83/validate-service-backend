import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from './order.entity';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(public readonly dataSource: DataSource, private readonly configService: ConfigService) {
    super(Order, dataSource.manager);
  }
}
