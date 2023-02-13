import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { User } from '@app/user/user.entity';
import { UserStatus } from '@app/user/user.types';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findOrCreate(queryRunner: QueryRunner, user: Partial<User>, ticketProviderId: number): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ uuid: user.uuid, ticketProviderId });

    if (existingUser) {
      return existingUser;
    }

    const { generatedMaps } = await queryRunner.manager
      .createQueryBuilder(User, 'user')
      .insert()
      .values({
        ...this.userRepository.create(user),
        ticketProviderId,
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
