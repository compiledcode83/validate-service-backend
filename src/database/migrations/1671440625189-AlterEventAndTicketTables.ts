import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterEventAndTicketTables1671440625189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('event', [
      'ticket_type',
      'resale_enabled',
      'resale_enabled_from_date',
      'resale_enabled_to_date',
      'resale_min_price',
      'resale_max_price',
    ]);

    await queryRunner.addColumns('event', [
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'image_url',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'website_url',
        type: 'text',
        isNullable: true,
      }),
    ]);

    await queryRunner.dropColumns('ticket', ['type', 'date_start', 'date_end', 'name']);

    await queryRunner.addColumns('ticket', [
      new TableColumn({
        name: 'ticket_type_id',
        type: 'int',
        unsigned: true,
        isNullable: false,
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
