import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserEventPattern, UserStatus } from './user.types';
import { UserCreateMessage } from './messages/user-create.message';
import { CreateTicketUserDto } from '@src/ticket/dto/create-ticket-user.dto';
import { QueryRunner } from 'typeorm';
import { OutboxService } from '@src/outbox/outbox.service';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly outboxService: OutboxService) {}

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByIdentifierAndProvider(propertyName: keyof User, value: string, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { [propertyName]: value, ticketProviderId } });
  }

  async findByUuid(uuid: string): Promise<User> {
    return this.userRepository.findOne({ where: { uuid } });
  }

  async update(uuid: string, body: UpdateUserDto): Promise<User> {
    await this.userRepository.update({ uuid }, this.userRepository.create(body));

    return this.findByUuid(uuid);
  }

  async create(body: CreateUserDto, ticketProviderId: number): Promise<User> {
    const queryRunner = this.userRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { ticketProvider, ...userData } = body;
      const user = await queryRunner.manager.save(this.userRepository.create({ ...userData, ticketProviderId }));
      const savedUser = await queryRunner.manager.findOneBy(User, { uuid: user.uuid });
      const payload = new UserCreateMessage({
        user: savedUser,
      });

      await this.outboxService.create(queryRunner, UserEventPattern.UserCreate, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(user.uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOrCreate(queryRunner: QueryRunner, user: CreateTicketUserDto): Promise<User> {
    if (user?.uuid) {
      return this.findByUuid(user.uuid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ticketProvider, ...userData } = user;
    const { generatedMaps } = await queryRunner.manager
      .createQueryBuilder(User, 'user')
      .insert()
      .values({
        ...this.userRepository.create(userData),
        ticketProviderId: user.ticketProvider.id,
      })
      .execute();
    const [insertedValues] = generatedMaps;

    return queryRunner.manager.findOneBy(User, { id: insertedValues.id });
  }

  async completeWithSuccess(uuid: string, walletAddress: string): Promise<void> {
    await this.userRepository.update({ uuid }, { walletAddress, status: UserStatus.Active });
  }

  async completeWithError(uuid: string, errorData: string): Promise<void> {
    await this.userRepository.update({ uuid }, { errorData });
  }
}
