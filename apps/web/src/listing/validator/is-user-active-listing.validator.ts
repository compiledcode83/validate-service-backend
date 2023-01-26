import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ListingCancelDto } from '../dto/listing.cancel.dto';
import { ListingValidator } from '../listing.validator';

@ValidatorConstraint({ name: 'isUserActiveListingValidator', async: true })
export class IsUserActiveListingValidator implements ValidatorConstraintInterface {
  constructor(private readonly listingValidator: ListingValidator) {}

  async validate(listingUuid: string, args: ValidationArguments) {
    const { user } = args.object as ListingCancelDto;

    return this.listingValidator.isUserActiveListing(listingUuid, user.id);
  }

  defaultMessage() {
    return `User doesn't have an active listing with this id`;
  }
}
