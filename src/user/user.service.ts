import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserEventPattern, UserStatus } from './user.types';
import { UserCreateMessage } from './messages/user-create.message';
import { CreateTicketUserDto } from '@src/ticket/dto/create-ticket-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly producerService: ProducerService) {}

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
    const { ticketProvider, ...userData } = body;
    const user = await this.userRepository.save(
      {
        ...this.userRepository.create(userData),
        ticketProviderId,
      },
      { reload: false },
    );
    const savedUser = await this.findByUuid(user.uuid);

    await this.producerService.send(
      UserEventPattern.UserCreate,
      new UserCreateMessage({
        user: savedUser,
      }),
    );

    return savedUser;
  }

  async findOrCreate(user: CreateTicketUserDto): Promise<User> {
    if (user?.uuid) {
      return this.findByUuid(user.uuid);
    }

    const { ticketProvider, ...userData } = user;

    return this.userRepository.save({
      ...this.userRepository.create(userData),
      ticketProviderId: user.ticketProvider.id,
    });
  }

  async completeWithSuccess(uuid: string, walletAddress: string): Promise<void> {
    await this.userRepository.update({ uuid }, { walletAddress, status: UserStatus.Active });
  }

  async completeWithError(uuid: string, errorData: string): Promise<void> {
    await this.userRepository.update({ uuid }, { errorData });
  }
}
