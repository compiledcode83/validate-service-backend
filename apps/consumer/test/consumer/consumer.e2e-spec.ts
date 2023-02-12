import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Transport } from '@nestjs/microservices';
import waitForExpect from 'wait-for-expect';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { TestHelper } from '../../../../libs/common/src/helpers/test.helper';
import { AppBootstrapManager } from '../../../api/src/app-bootstrap.manager';
import { TicketCreateReplyMessage } from '@consumer/messages/ticket-create-reply.message';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketDeleteReplyMessage } from '@consumer/messages/ticket-delete-reply.message';
import { TicketTransferFactory } from '@app/database/factories/ticket-transfer.factory';
import { TicketTransferReplyMessage } from '@consumer/messages/ticket-transfer-reply.message';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';
import { UserCreateReplyMessage } from '@consumer/messages/user-create-reply.message';
import { User } from '@app/user/user.entity';
import { ProducerService } from '@producer/producer.service';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketEventPattern, TicketStatus } from '@app/ticket/ticket.types';
import { TicketTransferEventPattern, TicketTransferStatus } from '@app/ticket-transfer/ticket-transfer.types';
import { UserEventPattern, UserStatus } from '@app/user/user.types';
import kafkaConfig from '@app/common/configs/kafka.config';
import { ConsumerService } from '@consumer/consumer.service';
import { EventFactory } from '@app/database/factories/event.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { OrderFactory } from '@app/database/factories/order.factory';
import { OrderPaymentStatus, OrderStatus } from '@app/order/order.types';
import { OrderPaymentFactory } from '@app/database/factories/order-payment.factory';
import { OrderPrimaryFactory } from '@app/database/factories/order-primary.factory';
import { OrderPrimaryTicketFactory } from '@app/database/factories/order-primary-ticket.factory';
import { Order } from '@app/order/order.entity';
import { MessageEventPattern, MessageStatus } from '@app/message/message.types';
import { MessageFactory } from '@app/database/factories/message.factory';
import { MessageSendReplyMessage } from '@app/message/messages/message-send-reply.message';
import { Message } from '@app/message/message.entity';
import { PaymentEventPattern, PaymentProviderType } from '@web/payment/payment.types';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { DateTime } from 'luxon';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';
import { OrderPayment } from '@app/order/order-payment.entity';
import { PaymentService } from '@web/payment/payment.service';
import { OrderService } from '@web/order/order.service';
import { Locale } from '@app/translation/translation.types';

jest.setTimeout(30000);
waitForExpect.defaults.timeout = 25000;

describe('Consumer microservice (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let producerService: ProducerService;
  let consumerService: ConsumerService;
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
          clientId: 'api-gateway-consumer',
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

    producerService = moduleFixture.get(ProducerService);
    consumerService = moduleFixture.get(ConsumerService);
    paymentService = moduleFixture.get(PaymentService);
    orderService = moduleFixture.get(OrderService);
    testHelper = new TestHelper(moduleFixture, jest);

    jest.spyOn(consumerService, 'handleTicketCreateReply');
    jest.spyOn(consumerService, 'handleTicketDeleteReply');
    jest.spyOn(consumerService, 'handleTicketTransferReply');
    jest.spyOn(consumerService, 'handleUserCreateReply');
    jest.spyOn(consumerService, 'handleTicketCreateReply');
    jest.spyOn(consumerService, 'handleMessageSendReply');
    jest.spyOn(consumerService, 'handlePaymentPaywallCancel');
    jest.spyOn(producerService, 'send');

    await AppDataSource.initialize();
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

  describe(`Testing ${TicketEventPattern.TicketCreateReply}`, () => {
    it('Expects to get a successfull ticket create reply and update ticket data', async () => {
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

      const replyMessage = new TicketCreateReplyMessage({
        ticket: {
          ...ticket,
          status: TicketStatus.Active,
          contractId: faker.finance.ethereumAddress(),
          ipfsUri: faker.internet.url(),
          tokenId: Number(faker.random.numeric(2)),
          transactionHash: faker.finance.ethereumAddress(),
        },
        user,
        operationUuid: uuid(),
      });

      await producerService.send(TicketEventPattern.TicketCreateReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleTicketCreateReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            operationUuid: replyMessage.operationUuid,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const updatedTicket = await AppDataSource.manager.getRepository(Ticket).findOneBy({ uuid: ticket.uuid });

      expect(updatedTicket).toEqual(
        expect.objectContaining({
          status: replyMessage.ticket.status,
          contractId: replyMessage.ticket.contractId,
          ipfsUri: replyMessage.ticket.ipfsUri,
          tokenId: replyMessage.ticket.tokenId,
          transactionHash: replyMessage.ticket.transactionHash,
        }),
      );
    });

    it('Expects to get an error for ticket create reply and update ticket data with it', async () => {
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

      const replyMessage = new TicketCreateReplyMessage({
        ticket: {
          ...ticket,
        },
        user,
        errorData: JSON.stringify({ message: 'Something went wrong' }),
        operationUuid: uuid(),
      });

      await producerService.send(TicketEventPattern.TicketCreateReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleTicketCreateReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            operationUuid: replyMessage.operationUuid,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const updatedTicket = await AppDataSource.manager.getRepository(Ticket).findOneBy({ uuid: ticket.uuid });

      expect(updatedTicket).toEqual(
        expect.objectContaining({
          status: TicketStatus.Creating,
          contractId: null,
          ipfsUri: null,
          tokenId: null,
          transactionHash: null,
          errorData: replyMessage.errorData,
        }),
      );
    });

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

  describe(`Testing ${TicketEventPattern.TicketDeleteReply}`, () => {
    it('Expects to get an error for ticket delete reply and update ticket data', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
      });

      const replyMessage = new TicketDeleteReplyMessage({
        ticket: {
          ...ticket,
        },
        errorData: JSON.stringify({ message: 'Something went wrong' }),
      });

      await producerService.send(TicketEventPattern.TicketDeleteReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleTicketDeleteReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            errorData: replyMessage.errorData,
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const updatedTicket = await AppDataSource.manager.getRepository(Ticket).findOneBy({ uuid: ticket.uuid });

      expect(updatedTicket).toEqual(
        expect.objectContaining({
          status: TicketStatus.Active,
          errorData: replyMessage.errorData,
        }),
      );
    });
  });

  describe(`Testing ${TicketTransferEventPattern.TicketTransferReply}`, () => {
    it('Expects to get a successfull ticket transfer reply and update ticket data', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const userFrom = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const userTo = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: userFrom.id });
      const ticketTransfer = await TicketTransferFactory.create({
        ticketProviderId: ticketProvider.id,
        userIdFrom: userFrom.id,
        userIdTo: userTo.id,
        ticketId: ticket.id,
        status: TicketTransferStatus.InProgress,
      });

      const replyMessage = new TicketTransferReplyMessage({
        transfer: {
          ...ticketTransfer,
          transactionHash: faker.finance.ethereumAddress(),
        },
      });

      await producerService.send(TicketTransferEventPattern.TicketTransferReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleTicketTransferReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            transfer: expect.objectContaining({
              uuid: ticketTransfer.uuid,
            }),
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const updatedTicket = await AppDataSource.manager.getRepository(Ticket).findOneBy({ uuid: ticket.uuid });
      const updatedTicketTransfer = await AppDataSource.manager
        .getRepository(TicketTransfer)
        .findOneBy({ uuid: ticketTransfer.uuid });

      expect(updatedTicketTransfer).toEqual(
        expect.objectContaining({
          status: TicketTransferStatus.Completed,
          transactionHash: replyMessage.transfer.transactionHash,
          finishedAt: expect.any(Date),
        }),
      );

      expect(updatedTicket).toEqual(
        expect.objectContaining({
          userId: userTo.id,
        }),
      );
    });

    it('Expects to get an error for ticket create reply and update ticket data with it', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const userFrom = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const userTo = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: userFrom.id });
      const ticketTransfer = await TicketTransferFactory.create({
        ticketProviderId: ticketProvider.id,
        userIdFrom: userFrom.id,
        userIdTo: userTo.id,
        ticketId: ticket.id,
        status: TicketTransferStatus.InProgress,
      });

      const replyMessage = new TicketTransferReplyMessage({
        transfer: {
          ...ticketTransfer,
        },
        errorData: JSON.stringify({ message: 'Error' }),
      });

      await producerService.send(TicketTransferEventPattern.TicketTransferReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleTicketTransferReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            transfer: expect.objectContaining({
              uuid: ticketTransfer.uuid,
            }),
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const notUpdatedTicket = await AppDataSource.manager.getRepository(Ticket).findOneBy({ uuid: ticket.uuid });
      const updatedTicketTransfer = await AppDataSource.manager
        .getRepository(TicketTransfer)
        .findOneBy({ uuid: ticketTransfer.uuid });

      expect(updatedTicketTransfer).toEqual(
        expect.objectContaining({
          status: TicketTransferStatus.InProgress,
          errorData: replyMessage.errorData,
        }),
      );

      expect(notUpdatedTicket).toEqual(
        expect.objectContaining({
          userId: userFrom.id,
        }),
      );
    });
  });

  describe(`Testing ${UserEventPattern.UserCreateReply}`, () => {
    it('Expects to get a successfull user create reply and update user data', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id, status: UserStatus.Creating });

      const replyMessage = new UserCreateReplyMessage({
        user: {
          ...user,
          walletAddress: faker.finance.ethereumAddress(),
        },
      });

      await producerService.send(UserEventPattern.UserCreateReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleUserCreateReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              uuid: replyMessage.user.uuid,
            }),
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const updatedUser = await AppDataSource.manager.getRepository(User).findOneBy({ uuid: user.uuid });

      expect(updatedUser).toEqual(
        expect.objectContaining({
          status: UserStatus.Active,
          walletAddress: replyMessage.user.walletAddress,
        }),
      );
    });

    it('Expects to get an error user create reply and update user data', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id, status: UserStatus.Creating });

      const replyMessage = new UserCreateReplyMessage({
        user: {
          ...user,
        },
        errorData: JSON.stringify({ message: 'Error' }),
      });

      await producerService.send(UserEventPattern.UserCreateReply, replyMessage);

      await waitForExpect(() => {
        expect(consumerService.handleUserCreateReply).toHaveBeenLastCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              uuid: replyMessage.user.uuid,
            }),
          }),
        );
      });

      await new Promise((fulfill) => setTimeout(fulfill, 1000));

      const updatedUser = await AppDataSource.manager.getRepository(User).findOneBy({ uuid: user.uuid });

      expect(updatedUser).toEqual(
        expect.objectContaining({
          status: UserStatus.Creating,
          errorData: replyMessage.errorData,
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

      const createdOrder = await orderService.findByUuid(order.uuid, Locale.en_US);

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

      const canceledOrder = await orderService.findByUuid(order.uuid, Locale.en_US);

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
      const createdOrder = await orderService.findByUuid(order.uuid, Locale.en_US);

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

      const completedOrder = await orderService.findByUuid(order.uuid, Locale.en_US);

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
