import { registerDecorator, ValidationOptions } from 'class-validator';

interface IsNumberStringInRangeOptions {
  min: number;
  max: number;
}

export function IsNumberStringInRange(
  numberStringValidatorOptions: IsNumberStringInRangeOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'IsNumberStringInRange',
      async: false,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: Object.keys(numberStringValidatorOptions),
      validator: {
        validate(value: any) {
          const parsedNumber = parseFloat(value);

          return (
            !Number.isNaN(parsedNumber) &&
            parsedNumber <= numberStringValidatorOptions.max &&
            parsedNumber >= numberStringValidatorOptions.min
          );
        },
      },
    });
  };
}
