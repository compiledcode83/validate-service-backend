import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserExistsByUuidValidator } from './validators/user-exists-by-uuid.validator';
import { UserExistsByIdentifierValidator } from './validators/user-exists-by-identifier.validator';
import { UserRepository } from './user.repository';
import { OutboxModule } from '@app/outbox/outbox.module';
import { User } from '@app/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), OutboxModule],
  providers: [UserService, UserExistsByUuidValidator, UserExistsByIdentifierValidator, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
