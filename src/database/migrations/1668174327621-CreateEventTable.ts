import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateEventTable1668174327621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'event',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            unsigned: true,
            generationStrategy: 'increment',
          },
          {
            name: 'uuid',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'ticket_provider_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'ticket_type',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'resale_enabled',
            type: 'tinyint',
            default: 0,
          },
          {
            name: 'resale_enabled_from_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'resale_enabled_to_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'resale_min_price',
            type: 'DECIMAL(12,2)',
            isNullable: true,
          },
          {
            name: 'resale_max_price',
            type: 'DECIMAL(12,2)',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'event',
      new TableIndex({
        name: 'idx_event_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'event',
      new TableIndex({
        name: 'idx_event_ticket_provider_id',
        columnNames: ['ticket_provider_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'event',
      new TableIndex({
        name: 'idx_event_name_ticket_type_tp',
        columnNames: ['name', 'ticket_type', 'ticket_provider_id'],
        isUnique: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
