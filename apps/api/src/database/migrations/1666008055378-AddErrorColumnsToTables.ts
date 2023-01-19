import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddErrorColumnsToTables1666008055378 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ticket',
      new TableColumn({
        name: 'error_data',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'ticket_transfer',
      new TableColumn({
        name: 'error_data',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'error_data',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
