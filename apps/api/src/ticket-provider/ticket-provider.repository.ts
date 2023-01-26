import { Injectable } from '@nestjs/common';
import { TicketProviderRepository as CommonRepository } from '@app/ticket-provider/ticket-provider.repository';

@Injectable()
export class TicketProviderRepository extends CommonRepository {
  async findMany(id: number) {
    return this.find({ where: { id } });
  }
}
