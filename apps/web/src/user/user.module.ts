import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserExistsByUuidValidator } from './validators/user-exists-by-uuid.validator';
import { UserController } from './user.controller';
import { User } from '@app/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserExistsByUuidValidator],
  exports: [UserService],
})
export class UserModule {}
