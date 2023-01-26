import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { IncomingHttpHeaders } from 'node:http';

@ValidatorConstraint({ name: 'headersValidator', async: true })
export class HeadersValidator implements ValidatorConstraintInterface {
  async validate(headers: IncomingHttpHeaders): Promise<boolean> {
    return !!headers && headers?.['user-agent'] !== undefined;
  }

  defaultMessage() {
    return `User-agent must be present in headers`;
  }
}
