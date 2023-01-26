import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderService } from '@web/order/order.service';
import { QueryRunner } from 'typeorm';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketTypeRepository } from './ticket-type.repository';

@Injectable()
export class TicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async findAllPaginated(searchParams: FindTicketTypesDto) {
    const paginatedResult = await this.ticketTypeRepository.getPaginatedQueryBuilder(searchParams);

    for (const ticketType of paginatedResult.data) {
      const boughtAndReservedCount = await this.orderService.getOneBoughtAndReservedCount(ticketType.id);

      ticketType.saleAmountAvailable = ticketType.saleAmount - boughtAndReservedCount;
    }

    return paginatedResult;
  }

  async findByUuid(uuid: string, relations: string[] = []): Promise<TicketType> {
    return this.ticketTypeRepository.findOne({ where: { uuid }, relations });
  }

  async findSellableWithLock(queryRunner: QueryRunner, uuid: string[]): Promise<TicketType[]> {
    return this.ticketTypeRepository.findSellableWithLock(queryRunner, uuid);
  }
}
