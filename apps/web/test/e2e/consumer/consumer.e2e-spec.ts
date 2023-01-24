import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Transport } from '@nestjs/microservices';
import waitForExpect from 'wait-for-expect';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { TicketEventPattern, TicketStatus } from '@app/ticket/ticket.types';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { ConsumerService } from '@consumer/consumer.service';
import { TestHelper } from '@app/common/helpers/test.helper';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { ProducerService } from '@producer/producer.service';
import { UserStatus } from '@app/user/user.types';
import { MessageStatus, MessageEventPattern } from '@app/message/message.types';
import { Message } from '@app/message/message.entity';
import { MessageSendReplyMessage } from '@app/message/messages/message-send-reply.message';
import { MessageFactory } from '@app/database/factories/message.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { PaymentEventPattern, PaymentProviderType } from '@web/payment/payment.types';
import { PaymentService } from '@web/payment/payment.service';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { DateTime } from 'luxon';
import { OrderFactory } from '@app/database/factories/order.factory';
import { OrderService } from '@web/order/order.service';
import { OrderPaymentStatus, OrderStatus } from '@app/order/order.types';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';
import { OrderPayment } from '@app/order/order-payment.entity';
import { Order } from '@app/order/order.entity';
import { TicketCreateReplyMessage } from '@consumer/messages/ticket-create-reply.message';
import { OrderPaymentFactory } from '@app/database/factories/order-payment.factory';
import { OrderPrimaryFactory } from '@app/database/factories/order-primary.factory';
import { OrderPrimaryTicketFactory } from '@app/database/factories/order-primary-ticket.factory';
import kafkaConfig from '@app/common/configs/kafka.config';
import { CurrencyEnum } from '@app/common/types/currency.enum';

jest.setTimeout(25000);
waitForExpect.defaults.timeout = 20000;

describe('Consumer microservice (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let consumerService: ConsumerService;
  let producerService: ProducerService;
  let paymentService: PaymentService;
  let orderService: OrderService;

  beforeAll(async () => {
    const kafkaOptions = kafkaConfig();

    moduleFixture = await AppBootstrapManager.getTestingModuleBuilder().compile();
    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'web-backend-consumer',
          brokers: kafkaOptions.brokerUrl.split(','),
          ssl: kafkaOptions.ssl,
        },
        consumer: {
          groupId: uuid(),
        },
        subscribe: {
          fromBeginning: false,
        },
      },
    });
    app.enableShutdownHooks();

    consumerService = moduleFixture.get(ConsumerService);
    producerService = moduleFixture.get(ProducerService);
    paymentService = moduleFixture.get(PaymentService);
    orderService = moduleFixture.get(OrderService);
    testHelper = new TestHelper(moduleFixture, jest);

    jest.spyOn(consumerService, 'handleTicketCreateReply');
    jest.spyOn(consumerService, 'handleMessageSendReply');
    jest.spyOn(consumerService, 'handlePaymentPaywallCancel');
    jest.spyOn(producerService, 'send');

    await AppDataSource.initialize();
    await testHelper.cleanDatabase();
    await app.startAllMicroservices();
    await app.init();
  });

  afterAll(async () => {
    jest.resetAllMocks().restoreAllMocks();
    await AppDataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  describe(`Testing ${TicketEventPattern.TicketCreateReply} handling`, () => {
    it(`Expects to get a ${TicketEventPattern.TicketCreateReply} event and update order status to completed`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id, status: UserStatus.Creating });
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Creating,
        contractId: null,
        ipfsUri: null,
        tokenId: null,
        transactionHash: null,
        eventId: event.id,
      });

      const order = await OrderFactory.create({ buyerId: user.id, status: OrderStatus.Paid }, [
        { ticketTypeId: ticketType.id, quantity: 1 },
      ]);
      await OrderPaymentFactory.create({ orderId: order.id, externalId: faker.random.word() });
      const orderPrimary = await OrderPrimaryFactory.create({ orderId: order.id, ticketTypeId: ticketType.id });
      await OrderPrimaryTicketFactory.create({ orderPrimaryId: orderPrimary.id, ticketId: ticket.id });

      const message = new TicketCreateReplyMessage({
        ticket: {
          ...ticket,
          contractId: faker.finance.ethereumAddress(),
          ipfsUri: faker.internet.url(),
          tokenId: Number(faker.random.numeric(2)),
          transactionHash: faker.finance.ethereumAddress(),
          ticketType: {
            ...ticketType,
            event,
          },
        },
        user,
        operationUuid: uuid(),
      });

      await producerService.send(TicketEventPattern.TicketCreateReply, message);

      await waitForExpect(() => {
        expect(consumerService.handleTicketCreateReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            operationUuid: message.operationUuid,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 500));

      const updatedOrder = await AppDataSource.manager.getRepository(Order).findOne({ where: { uuid: order.uuid } });

      expect(updatedOrder).toEqual(
        expect.objectContaining({
          uuid: order.uuid,
          status: OrderStatus.Completed,
        }),
      );
    });

    it(`Expects to get a ${TicketEventPattern.TicketCreateReply} event and not update order status, because it's still unpaid`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id, status: UserStatus.Creating });
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Creating,
        contractId: null,
        ipfsUri: null,
        tokenId: null,
        transactionHash: null,
        eventId: event.id,
      });

      const order = await OrderFactory.create({ buyerId: user.id, status: OrderStatus.Created }, [
        { ticketTypeId: ticketType.id, quantity: 1 },
      ]);
      await OrderPaymentFactory.create({ orderId: order.id, externalId: faker.random.word() });
      const orderPrimary = await OrderPrimaryFactory.create({ orderId: order.id, ticketTypeId: ticketType.id });
      await OrderPrimaryTicketFactory.create({ orderPrimaryId: orderPrimary.id, ticketId: ticket.id });

      const message = new TicketCreateReplyMessage({
        ticket: {
          ...ticket,
          contractId: faker.finance.ethereumAddress(),
          ipfsUri: faker.internet.url(),
          tokenId: Number(faker.random.numeric(2)),
          transactionHash: faker.finance.ethereumAddress(),
          ticketType: {
            ...ticketType,
            event,
          },
        },
        user,
        operationUuid: uuid(),
      });

      await producerService.send(TicketEventPattern.TicketCreateReply, message);

      await waitForExpect(() => {
        expect(consumerService.handleTicketCreateReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            operationUuid: message.operationUuid,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 500));

      const updatedOrder = await AppDataSource.manager.getRepository(Order).findOne({ where: { uuid: order.uuid } });

      expect(updatedOrder).toEqual(
        expect.objectContaining({
          uuid: order.uuid,
          status: OrderStatus.Created,
        }),
      );
    });
  });

  describe(`Testing ${MessageEventPattern.SendReply} handling`, () => {
    it(`Expects to get successfull ${MessageEventPattern.SendReply} event and save message status`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Creating,
        contractId: null,
        ipfsUri: null,
        tokenId: null,
        transactionHash: null,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        status: MessageStatus.Sent,
        sendTo: user.phoneNumber,
      });
      const sendReplyMessage = new MessageSendReplyMessage({
        messageUuid: message.uuid,
        status: MessageStatus.Sent,
        operationUuid: uuid(),
      });

      await producerService.send(MessageEventPattern.SendReply, sendReplyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleMessageSendReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            messageUuid: sendReplyMessage.messageUuid,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 500));

      const updatedMessage = await AppDataSource.manager.getRepository(Message).findOneBy({ uuid: message.uuid });

      expect(updatedMessage).toEqual(
        expect.objectContaining({
          status: sendReplyMessage.status,
        }),
      );
    });

    it(`Expects to get error ${MessageEventPattern.SendReply} event and save message status and errorData`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Creating,
        contractId: null,
        ipfsUri: null,
        tokenId: null,
        transactionHash: null,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        status: MessageStatus.Sent,
        sendTo: user.phoneNumber,
      });
      const sendReplyMessage = new MessageSendReplyMessage({
        messageUuid: message.uuid,
        status: MessageStatus.Error,
        errorData: JSON.stringify({ message: 'Error' }),
        operationUuid: uuid(),
      });

      await producerService.send(MessageEventPattern.SendReply, sendReplyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleMessageSendReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            messageUuid: sendReplyMessage.messageUuid,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 500));

      const updatedMessage = await AppDataSource.manager.getRepository(Message).findOneBy({ uuid: message.uuid });

      expect(updatedMessage).toEqual(
        expect.objectContaining({
          status: sendReplyMessage.status,
          errorData: sendReplyMessage.errorData,
        }),
      );
    });
  });

  describe(`Testing ${PaymentEventPattern.CancelPaywall} handling`, () => {
    it(`Expects to get ${PaymentEventPattern.CancelPaywall} event and cancel checkout session successfully`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });

      const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
      await paymentService.create({ orderUuid: order.uuid, paymentProviderType: PaymentProviderType.Stripe });

      const createdOrder = await orderService.findByUuid(order.uuid);

      expect(createdOrder).toEqual(
        expect.objectContaining({
          uuid: order.uuid,
          status: OrderStatus.Created,
          payment: expect.objectContaining({
            externalStatus: OrderPaymentStatus.Pending,
          }),
        }),
      );

      const paymentCancelPaywallMessage = new PaymentCancelPaywallMessage({ order: createdOrder });

      await producerService.send(PaymentEventPattern.CancelPaywall, paymentCancelPaywallMessage);

      await waitForExpect(() => {
        expect(consumerService.handlePaymentPaywallCancel).toHaveBeenLastCalledWith(
          expect.objectContaining({
            order: expect.objectContaining({
              uuid: createdOrder.uuid,
            }),
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 500));

      const canceledOrder = await orderService.findByUuid(order.uuid);

      expect(canceledOrder).toEqual(
        expect.objectContaining({
          uuid: order.uuid,
          status: OrderStatus.Canceled,
          payment: expect.objectContaining({
            externalStatus: OrderPaymentStatus.Declined,
          }),
        }),
      );
    });

    it(`Expects to get ${PaymentEventPattern.CancelPaywall} event and skip canceling completed order`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });

      const order = await OrderFactory.create({ buyerId: user.id, status: OrderStatus.Completed }, [
        { ticketTypeId: ticketType.id, quantity: 1 },
      ]);
      await paymentService.create({ orderUuid: order.uuid, paymentProviderType: PaymentProviderType.Stripe });
      const createdOrder = await orderService.findByUuid(order.uuid);

      await AppDataSource.manager
        .getRepository(OrderPayment)
        .update({ orderId: order.id }, { externalStatus: OrderPaymentStatus.Completed });
      await AppDataSource.manager.getRepository(Order).update({ id: order.id }, { status: OrderStatus.Completed });

      const paymentCancelPaywallMessage = new PaymentCancelPaywallMessage({ order: createdOrder });

      await producerService.send(PaymentEventPattern.CancelPaywall, paymentCancelPaywallMessage);
      await waitForExpect(() => {
        expect(consumerService.handlePaymentPaywallCancel).toHaveBeenLastCalledWith(
          expect.objectContaining({
            order: expect.objectContaining({
              uuid: createdOrder.uuid,
            }),
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1500));

      const completedOrder = await orderService.findByUuid(order.uuid);

      expect(completedOrder).toEqual(
        expect.objectContaining({
          uuid: order.uuid,
          status: OrderStatus.Completed,
          payment: expect.objectContaining({
            externalStatus: OrderPaymentStatus.Completed,
          }),
        }),
      );
    });
  });
});
