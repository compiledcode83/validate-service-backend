import { ListingRepository } from './listing.repository';
import { ListingStatus } from './listing.types';
import { UserService } from '@app/user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListingService {
  constructor(private readonly listingRepo: ListingRepository, private readonly userService: UserService) {}

  async cancel(listingUuid: string, userUuid: string) {
    const user = await this.userService.findOne(userUuid);

    return this.listingRepo.update({ uuid: listingUuid, userId: user.id }, { status: ListingStatus.Canceled });
  }
}
