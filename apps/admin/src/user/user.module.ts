import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderModule } from '@admin/ticket-provider/ticket-provider.module';
import { TicketProviderValidator } from '@admin/ticket-provider/ticket-provider.validator';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserExistsValidatorByIdentifier } from './validators/user-exists-by-identifier.validator';
import { UserValidator } from './user.validator';
import { User } from '@app/user/user.entity';
import { UserSubscriber } from '@app/user/user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TicketProviderModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    TicketProviderValidator,
    TicketProviderExistsValidator,
    UserExistsValidatorByIdentifier,
    UserValidator,
    UserSubscriber,
  ],
  exports: [UserService],
})
export class UserModule {}
