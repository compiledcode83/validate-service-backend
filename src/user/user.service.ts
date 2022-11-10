import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserEventPattern, UserStatus } from './user.types';
import { WalletCreateMessage } from './messages/wallet-create.message';

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
    const userEntity: Partial<User> = {
      ...this.userRepository.create(body),
      ticketProviderId,
    };

    const user = await this.userRepository.save(userEntity, { reload: false });

    await this.producerService.emit(
      UserEventPattern.WalletCreate,
      new WalletCreateMessage({
        userUuid: user.uuid,
      }),
    );

    return this.findByUuid(user.uuid);
  }

  async completeWithSuccess(uuid: string, walletAddress: string): Promise<void> {
    await this.userRepository.update({ uuid }, { walletAddress, status: UserStatus.Active });
  }

  async completeWithError(uuid: string, errorData: string): Promise<void> {
    await this.userRepository.update({ uuid }, { errorData });
  }
}
