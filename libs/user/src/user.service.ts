import { UserRepository } from './user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async findOne(userUuid: string) {
    return this.userRepo.findOne({ where: { uuid: userUuid } });
  }
}
