import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserExistsByUuidValidator } from './validator/user-exists-by-uuid.validator';

@Module({
  providers: [UserService, UserRepository, UserExistsByUuidValidator],
  exports: [UserService],
})
export class UserModule {}
