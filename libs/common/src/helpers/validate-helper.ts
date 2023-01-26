export class ValidateHelper {
  public static sanitize(searchTerm: string): string {
    if (typeof searchTerm !== 'string') {
      return '';
    }

    const sanitized = searchTerm.match(/[\p{L}|\p{N}|\s]/gu);

    return sanitized ? sanitized.join('') : '';
  }
}
