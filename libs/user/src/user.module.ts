import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserRepository],
})
export class UserModule {}
