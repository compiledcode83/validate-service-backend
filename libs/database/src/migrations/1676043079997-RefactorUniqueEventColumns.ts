import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class RefactorUniqueEventColumns1676043079997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('ticket_type', 'idx_ticket_type_uuid');
    await queryRunner.dropIndex('ticket_type', 'idx_ticket_type_unique_name');
    await queryRunner.dropIndex('event', 'idx_event_ticket_unique_name');

    try {
      await queryRunner.dropIndex('event', 'idx_event_name_ticket_type_tp');
    } catch (e) {}

    await queryRunner.createIndex(
      'ticket_type',
      new TableIndex({
        name: 'idx_ticket_type_uuid',
        columnNames: ['uuid'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'event',
      new TableIndex({
        name: 'idx_event_uuid_ticket_provider_id',
        columnNames: ['uuid', 'ticket_provider_id'],
        isUnique: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
