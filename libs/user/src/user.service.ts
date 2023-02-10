import { UserRepository } from './user.repository';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { QueryRunner } from 'typeorm';
import { CreateTicketUserDto } from '@app/ticket/dto/create-ticket-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async findOne(userUuid: string) {
    return this.userRepo.findOne({ where: { uuid: userUuid } });
  }

  async findByUuid(uuid: string) {
    return this.userRepo.findOne({ where: { uuid } });
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<User> {
    if (ticketProviderId) {
      return this.userRepo.findOne({ where: { uuid, ticketProviderId } });
    }

    return this.userRepo.findOne({ where: { uuid } });
  }

  async findOrCreate(queryRunner: QueryRunner, user: CreateTicketUserDto): Promise<User> {
    if (user?.uuid) {
      return this.findByUuid(user.uuid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ticketProvider, ...userData } = user;

    return this.userRepo.save({
      ...userData,
      ticketProviderId: ticketProvider.id,
    });
  }
}
