import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Transport } from '@nestjs/microservices';
import waitForExpect from 'wait-for-expect';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { TestHelper } from '../helpers/test.helper';
import { ProducerService } from '../../src/producer/producer.service';
import { AppBootstrapManager } from '../../src/app-bootstrap.manager';
import { AppDataSource } from '../../src/config/datasource';
import { TicketEventPattern, TicketStatus } from '@api/ticket/ticket.types';
import { TicketCreateReplyMessage } from '@api/consumer/messages/ticket-create-reply.message';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { Ticket } from '@api/ticket/ticket.entity';
import { ConsumerService } from '@api/consumer/consumer.service';
import { TicketDeleteReplyMessage } from '@api/consumer/messages/ticket-delete-reply.message';
import { TicketTransferEventPattern, TicketTransferStatus } from '@api/ticket-transfer/ticket-transfer.types';
import { TicketTransferFactory } from '@app/database/factories/ticket-transfer.factory';
import { TicketTransferReplyMessage } from '@api/consumer/messages/ticket-transfer-reply.message';
import { TicketTransfer } from '@api/ticket-transfer/ticket-transfer.entity';
import kafkaConfig from '@api/config/kafka.config';
import { UserEventPattern, UserStatus } from '@api/user/user.types';
import { UserCreateReplyMessage } from '@api/consumer/messages/user-create-reply.message';
import { User } from '@api/user/user.entity';

jest.setTimeout(30000);
waitForExpect.defaults.timeout = 25000;

describe('Consumer microservice (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let producerService: ProducerService;
  let consumerService: ConsumerService;

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
    testHelper = new TestHelper(moduleFixture, jest);

    jest.spyOn(consumerService, 'handleTicketCreateReply');
    jest.spyOn(consumerService, 'handleTicketDeleteReply');
    jest.spyOn(consumerService, 'handleTicketTransferReply');
    jest.spyOn(consumerService, 'handleUserCreateReply');

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
});
