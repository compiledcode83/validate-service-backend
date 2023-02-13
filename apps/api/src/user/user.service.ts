import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { UserCreateMessage } from '@app/user/messages/user-create.message';
import { User } from '@app/user/user.entity';
import { UserEventPattern } from '@app/user/user.types';
import { OutboxService } from '@app/outbox/outbox.service';

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
}
