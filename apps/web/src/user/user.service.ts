import { User } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByIdentifierAndProvider(propertyName: keyof User, value: string, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { [propertyName]: value, ticketProviderId } });
  }

  async findByUuid(uuid: string): Promise<User> {
    return this.userRepository.findOne({ where: { uuid } });
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findByPhoneNumberOrCreate(queryRunner: QueryRunner, data: Partial<User>): Promise<User> {
    const user = await this.findByPhoneNumber(data.phoneNumber);

    if (user) {
      return user;
    }

    return queryRunner.manager.save(this.userRepository.create(data));
  }

  async update(uuid: string, body: UpdateUserDto): Promise<User> {
    await this.userRepository.update({ uuid }, body);

    return this.findByUuid(uuid);
  }
}
