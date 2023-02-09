import { UserRepository } from '@app/user/user.repository';
import { Module } from '@nestjs/common';
import { ListingRepository } from './listing.repository';
import { UserModule } from '@app/user/user.module';
import { UserService } from '@app/user/user.service';

@Module({
  imports: [UserModule],
  providers: [ListingRepository, UserRepository, UserService],
})
export class ListingModule {}
