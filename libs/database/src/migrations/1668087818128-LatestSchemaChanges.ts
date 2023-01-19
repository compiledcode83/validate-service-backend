import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class LatestSchemaChanges1668087818128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('ticket', [
      new TableColumn({
        name: 'hash',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_start',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_end',
        type: 'date',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(
      'ticket',
      new TableIndex({
        name: 'idx_ticket_hash',
        columnNames: ['hash'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket',
      new TableIndex({
        name: 'idx_ticket_date_start',
        columnNames: ['date_start'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'ticket',
      new TableIndex({
        name: 'idx_ticket_date_end',
        columnNames: ['date_end'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
