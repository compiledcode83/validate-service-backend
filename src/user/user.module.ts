import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserExistsByUuidValidator } from './validators/user-exists-by-uuid.validator';
import { UserExistsByIdentifierValidator } from './validators/user-exists-by-identifier.validator';
import { OutboxModule } from '@src/outbox/outbox.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), OutboxModule],
  providers: [UserService, UserRepository, UserExistsByUuidValidator, UserExistsByIdentifierValidator],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
