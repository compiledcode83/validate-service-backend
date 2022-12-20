import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddUqinueIndexesEventAndTicketType1671543439451 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'event',
      new TableIndex({
        name: 'idx_event_ticket_unique_name',
        columnNames: ['ticket_provider_id', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket_type',
      new TableIndex({
        name: 'idx_ticket_type_unique_name',
        columnNames: ['event_id', 'name', 'ticket_date_start', 'ticket_date_end'],
        isUnique: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
