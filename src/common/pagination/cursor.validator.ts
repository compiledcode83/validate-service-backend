import { isArray, isBase64, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'cursorValidator', async: true })
export class CursorValidator implements ValidatorConstraintInterface {
  async validate(cursor: any) {
    if (!isBase64(cursor)) {
      return false;
    }

    const decodedCursorString = Buffer.from(cursor, 'base64').toString('utf-8');

    try {
      const decodedCursor = JSON.parse(decodedCursorString);

      if (isArray(decodedCursor)) {
        return decodedCursor.length === 2 && decodedCursor.every(this.isPrimitive);
      }

      return this.isPrimitive(decodedCursor);
    } catch (err) {
      return this.isPrimitive(decodedCursorString);
    }
  }

  defaultMessage() {
    return `Invalid cursor`;
  }

  private isPrimitive(value: any) {
    return typeof value === 'number' || typeof value === 'string';
  }
}
