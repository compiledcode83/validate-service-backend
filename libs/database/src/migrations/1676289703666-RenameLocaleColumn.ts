import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RenameLocaleColumn1676289703666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'translation',
      'locale',
      new TableColumn({
        name: 'locale',
        type: 'enum',
        enum: ['en-US', 'pt-BR'],
        default: `'en-US'`,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
