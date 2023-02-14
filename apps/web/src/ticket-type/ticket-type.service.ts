import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { Locale } from '@app/translation/translation.types';
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

  async findAllPaginated(searchParams: FindTicketTypesDto, locale: Locale) {
    const paginatedResult = await this.ticketTypeRepository.getPaginatedQueryBuilder(searchParams, locale);

    for (const ticketType of paginatedResult.data) {
      const boughtAndReservedCount = await this.orderService.getOneBoughtAndReservedCount(ticketType.id);

      ticketType.saleAmountAvailable = ticketType.saleAmount - boughtAndReservedCount;
    }

    return paginatedResult;
  }

  async findSellableWithLock(queryRunner: QueryRunner, uuid: string[]): Promise<TicketType[]> {
    return this.ticketTypeRepository.findSellableWithLock(queryRunner, uuid);
  }
}
