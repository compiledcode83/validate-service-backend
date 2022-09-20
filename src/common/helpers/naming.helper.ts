export class NamingHelper {
  static camelCaseToSnakeCase(word: string): string {
    return word.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
