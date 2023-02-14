import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserExistsByUuidValidator } from './validators/user-exists-by-uuid.validator';
import { UserController } from './user.controller';
import { User } from '@app/user/user.entity';
import { UserSubscriber } from '@app/user/user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserExistsByUuidValidator, UserSubscriber],
  exports: [UserService],
})
export class UserModule {}
