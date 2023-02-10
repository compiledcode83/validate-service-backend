import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserValidationDto } from './dto/create-user.validation.dto';
import { UpdateUserValidationDto } from './dto/update-user.validation.dto';
import { UserFilterDto } from './dto/user.filter.dto';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketUserDto } from '@admin/ticket/dto/create-ticket-user.dto';
import { User } from '@app/user/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserData: CreateUserValidationDto) {
    const user = await this.userRepository.save(createUserData);

    /** @todo create outbox message */

    return this.userRepository.findOne({ where: { id: user.id } });
  }

  async update(id: number, updateUserDto: UpdateUserValidationDto) {
    await this.userRepository.update({ id: id }, updateUserDto);

    return this.findById(id);
  }

  async findAllPaginated(searchParams: UserFilterDto): Promise<PagingResult<User>> {
    return this.userRepository.getPaginatedQueryBuilder(searchParams);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUuid(uuid: string): Promise<User> {
    return this.userRepository.findOne({ where: { uuid } });
  }

  async findByUserIdAndTicketProviderId(userId: number, ticketProviderId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId, ticketProviderId } });
  }

  async findUserByEmailOrPhoneNumber(value: string): Promise<boolean> {
    let user = this.userRepository.findBy({ email: value });

    if (!user) {
      user = this.userRepository.findBy({ phoneNumber: value });
    }

    return user !== null;
  }

  async isUserExist(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });

    return user !== null;
  }

  async findOrCreate(user: CreateTicketUserDto, ticketProviderId: number): Promise<User> {
    if (user?.userId) {
      return this.findById(user?.userId);
    }

    return this.userRepository.save({
      ...this.userRepository.create({
        ...user,
        ticketProviderId,
      }),
      ticketProviderId,
    });
  }
}
