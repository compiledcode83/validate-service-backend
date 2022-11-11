import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DateTime } from 'luxon';

@ValidatorConstraint({ name: 'dateValidator', async: true })
export class DateValidator implements ValidatorConstraintInterface {
  async validate(date: string) {
    if (!date) {
      return false;
    }

    const luxonDate = DateTime.fromFormat(date, 'yyyy-MM-dd');

    return luxonDate.isValid;
  }

  defaultMessage() {
    return `Acceptable date format is yyyy-MM-dd.`;
  }
}
