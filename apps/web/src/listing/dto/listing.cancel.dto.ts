import { Allow, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/user/user.entity';
import { IsUserActiveListingValidator } from '../validator/is-user-active-listing.validator';
import { Type } from 'class-transformer';

export class ListingCancelDto {
  @ApiProperty({ example: 1, required: true, description: 'Value must be a valid listing id' })
  @Type(() => String)
  @Validate(IsUserActiveListingValidator)
  listingUuid: string;

  @Allow()
  user: User;
}
