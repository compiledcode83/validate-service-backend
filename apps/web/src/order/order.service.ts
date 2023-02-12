import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nanoid from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';
import { PaymentEventPattern } from '@web/payment/payment.types';
import { TicketTypeService } from '@web/ticket-type/ticket-type.service';
import { TicketService } from '@web/ticket/ticket.service';
import { DateTime } from 'luxon';
import { MoreThanOrEqual, QueryRunner, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { MessageService } from '@web/message/message.service';
import { OrderRepository } from './order.repository';
import { OrderPayment } from '@app/order/order-payment.entity';
import { OrderPrimaryTicket } from '@app/order/order-primary-ticket.entity';
import { OutboxService } from '@app/outbox/outbox.service';
import { Order } from '@app/order/order.entity';
import { OrderMarketType, OrderPaymentStatus, OrderStatus, SYSTEM_SELLER } from '@app/order/order.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { OrderPrimary } from '@app/order/order-primary.entity';
import { TicketCreateMessage } from '@app/ticket/messages/ticket-create.message';
import { Ticket } from '@app/ticket/ticket.entity';
import { DEFAULT_IMAGE, TicketEventPattern } from '@app/ticket/ticket.types';
import { TranslationService } from '@app/translation/translation.service';
import { Locale } from '@app/translation/translation.types';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectRepository(OrderPayment)
    private readonly orderPayment: Repository<OrderPayment>,
    @InjectRepository(OrderPrimaryTicket)
    private readonly orderPrimaryTicketRepository: Repository<OrderPrimaryTicket>,
    @Inject(forwardRef(() => TicketTypeService))
    private readonly ticketTypeService: TicketTypeService,
    private readonly configService: ConfigService,
    private readonly outboxService: OutboxService,
    private readonly ticketService: TicketService,
    private readonly messageService: MessageService,
  ) {}

  async findByUuid(uuid: string, locale: Locale): Promise<Order> {
    const order = await this.orderRepository.getQbWithRelations().where({ uuid }).getOne();

    this.mapTranslations(order, locale);

    return order;
  }

  async findById(queryRunner: QueryRunner, id: number, locale: Locale): Promise<Order> {
    const order = await this.orderRepository.getQbWithRelations(queryRunner).where({ id }).getOne();

    this.mapTranslations(order, locale);

    return order;
  }

  async findByUuidAndUser(uuid: string, userId: number, locale: Locale): Promise<Order> {
    const order = await this.orderRepository
      .getQbWithRelations()
      .where([
        { buyerId: userId, uuid },
        { sellerId: userId, uuid },
      ])
      .getOne();

    this.mapTranslations(order, locale);

    return order;
  }

  async findByTicketId(ticketId: number, locale: Locale = Locale.en_US): Promise<Order> {
    const order = await this.orderRepository
      .getQbWithRelations()
      .where('tickets.ticketId = :ticketId', { ticketId })
      .getOne();

    this.mapTranslations(order, locale);

    return order;
  }

  async findPayableOrder(uuid: string, userId: number, locale: Locale = Locale.en_US): Promise<Order> {
    const order = await this.orderRepository
      .getQbWithRelations()
      .where({
        uuid,
        buyerId: userId,
        status: OrderStatus.Created,
        reservedUntil: MoreThanOrEqual(DateTime.now().toJSDate()),
      })
      .andWhere('payment.id IS NULL')
      .getOne();

    this.mapTranslations(order, locale);

    return order;
  }

  async findCompletableByExternalId(externalId: string, locale: Locale = Locale.en_US): Promise<Order> {
    const order = await this.orderRepository
      .getQbWithRelations()
      .where({
        payment: {
          externalId,
          externalStatus: OrderPaymentStatus.Pending,
        },
        status: OrderStatus.Created,
      })
      .getOne();

    this.mapTranslations(order, locale);

    return order;
  }

  async create(body: CreateOrderDto, locale: Locale): Promise<Order> {
    if (body.marketType === OrderMarketType.Primary) {
      return this.createPrimarySale(body, locale);
    }
  }

  async createPrimarySale(body: CreateOrderDto, locale: Locale): Promise<Order> {
    const queryRunner = this.orderRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ticketTypeMap = body.ticketTypes.reduce((acc, item) => {
        acc[item.ticketTypeUuid] = item.quantity;

        return acc;
      }, {});
      const ticketTypeUuid = Object.keys(ticketTypeMap);
      const ticketTypes = await this.ticketTypeService.findSellableWithLock(queryRunner, ticketTypeUuid);

      if (ticketTypes.length === 0 || ticketTypeUuid.length !== ticketTypes.length) {
        throw new BadRequestException(`Sale for this ticket type is not enabled`);
      }

      const ticketTypeId = ticketTypes.map((ticketType) => ticketType.id);
      const boughtAndReservedCount = await this.orderRepository.getManyBoughtAndReservedCount(
        queryRunner,
        ticketTypeId,
      );
      const orderPrimaryValues = [];

      let orderSalePrice = 0;
      let orderCurrency: CurrencyEnum;

      for (const ticketType of ticketTypes) {
        const reservedCount = Number(boughtAndReservedCount?.[ticketType.id] ?? 0);
        const leftCount = ticketType.saleAmount - reservedCount;
        const requestedCount = Number(ticketTypeMap[ticketType.uuid]);

        if (requestedCount > leftCount) {
          throw new BadRequestException(`One or more tickets are unavailable`);
        }

        orderSalePrice += Number(ticketType.salePrice) * requestedCount;
        orderCurrency = ticketType.saleCurrency;

        orderPrimaryValues.push({
          ticketTypeId: ticketType.id,
          quantity: requestedCount,
        });
      }

      const reservedUntil = DateTime.now()
        .plus({ minutes: this.configService.get('orderConfig.primarySaleReservationMinutes') })
        .toJSDate();
      const order = await queryRunner.manager.save(
        this.orderRepository.create({
          marketType: OrderMarketType.Primary,
          sellerId: SYSTEM_SELLER,
          buyerId: body.user.id,
          salePrice: String(orderSalePrice),
          saleCurrency: orderCurrency,
          reservedUntil,
          status: OrderStatus.Created,
        }),
      );

      orderPrimaryValues.forEach((item) => {
        item['orderId'] = order.id;
      });

      await queryRunner.manager.insert(OrderPrimary, orderPrimaryValues);
      await queryRunner.commitTransaction();

      return this.findByUuid(order.uuid, locale);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createOrderPayment(
    orderId: number,
    externalId: string,
    externalData: string,
    locale: Locale,
  ): Promise<OrderPayment> {
    const queryRunner = this.orderRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const orderPayment = await queryRunner.manager.save(
        this.orderPayment.create({
          orderId: orderId,
          externalId,
          externalStatus: OrderPaymentStatus.Pending,
          externalData,
        }),
      );

      const order = await this.findById(queryRunner, orderId, locale);
      const payload = new PaymentCancelPaywallMessage({ order });

      await this.outboxService.create(queryRunner, PaymentEventPattern.CancelPaywall, payload, order.reservedUntil);
      await queryRunner.commitTransaction();

      return orderPayment;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(orderId: number): Promise<void> {
    const queryRunner = this.orderRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.update(
        OrderPayment,
        {
          orderId,
          externalStatus: OrderPaymentStatus.Pending,
        },
        {
          externalStatus: OrderPaymentStatus.Declined,
        },
      );

      await queryRunner.manager.update(
        Order,
        {
          id: orderId,
          status: OrderStatus.Created,
        },
        {
          status: OrderStatus.Canceled,
        },
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async completeOrder(orderId: number): Promise<void> {
    const queryRunner = this.orderRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.update(
        Order,
        {
          id: orderId,
          status: OrderStatus.Paid,
        },
        {
          status: OrderStatus.Completed,
        },
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async handleOrderPayment(order: Order): Promise<void> {
    const queryRunner = this.orderRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.update(Order, { id: order.id }, { status: OrderStatus.Paid });
      await queryRunner.manager.update(
        OrderPayment,
        { id: order.payment.id },
        { externalStatus: OrderPaymentStatus.Completed },
      );

      await this.createTickets(queryRunner, order);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getOneBoughtAndReservedCount(ticketTypeId: number): Promise<number> {
    return this.orderRepository.getOneBoughtAndReservedCount(ticketTypeId);
  }

  private async createTickets(queryRunner: QueryRunner, order: Order) {
    const purchaseId = nanoid();

    for (const primaryPurchase of order.primaryPurchases) {
      for (let i = 1; i <= primaryPurchase.quantity; i++) {
        const createdTicket = await queryRunner.manager.save(
          Ticket,
          this.ticketService.ticketRepository.create({
            ticketProviderId: primaryPurchase.ticketType.event.ticketProviderId,
            eventId: primaryPurchase.ticketType.eventId,
            ticketTypeId: primaryPurchase.ticketType.id,
            userId: order.buyerId,
            imageUrl: primaryPurchase.ticketType.event.imageUrl || DEFAULT_IMAGE,
            purchaseId,
          }),
        );

        await queryRunner.manager.save(
          this.orderPrimaryTicketRepository.create({
            orderPrimaryId: primaryPurchase.id,
            ticketId: createdTicket.id,
          }),
        );

        const ticket = await queryRunner.manager.findOne(Ticket, {
          where: { id: createdTicket.id },
          relations: ['ticketType', 'ticketType.translations', 'ticketType.event.translations', 'user'],
        });

        /** @todo we don't know what locale to use in here */
        TranslationService.mapEntity(ticket.ticketType, Locale.en_US);
        TranslationService.mapEntity(ticket.ticketType.event, Locale.en_US);

        const payload = new TicketCreateMessage({
          ticket,
          user: ticket.user,
        });
        await this.outboxService.create(queryRunner, TicketEventPattern.TicketCreate, payload);
      }
    }

    await this.messageService.createTicketsPurchaseMessages(queryRunner, purchaseId, order.buyer);
  }

  private mapTranslations(order: Order, locale: Locale): void {
    order?.primaryPurchases.map((primaryPurchase) => {
      TranslationService.mapEntity(primaryPurchase.ticketType, locale);
      TranslationService.mapEntity(primaryPurchase.ticketType.event, locale);
      delete primaryPurchase.ticketType.translations;
      delete primaryPurchase.ticketType.event.translations;
    });
  }
}
