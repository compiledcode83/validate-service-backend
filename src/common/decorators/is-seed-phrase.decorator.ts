import { SEED_PHRASE_LENGTH } from '@src/user/user.types';
import { isString, registerDecorator, ValidationOptions } from 'class-validator';

export function IsSeedPhrase(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isSeedPhrase',
      async: false,
      target: object.constructor,
      constraints: [],
      propertyName,
      options: {
        message: `Seed phrase should be a string of length ${SEED_PHRASE_LENGTH}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any): boolean {
          return isString(value) && value?.length === SEED_PHRASE_LENGTH;
        },
      },
    });
  };
}
