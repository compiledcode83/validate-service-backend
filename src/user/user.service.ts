import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { uuid, ticketProviderId } });
  }
}
