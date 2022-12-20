import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTicketTypeTable1671440088540 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_type',
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
            name: 'event_id',
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
            name: 'ticket_date_start',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'ticket_date_end',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'sale_enabled',
            type: 'tinyint',
            default: 0,
          },
          {
            name: 'sale_enabled_from_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'sale_enabled_to_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'sale_amount',
            type: 'int',
            default: 0,
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
      'ticket_type',
      new TableIndex({
        name: 'idx_ticket_type_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket_type',
      new TableIndex({
        name: 'idx_ticket_type_event_id',
        columnNames: ['event_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'ticket_type',
      new TableIndex({
        name: 'idx_ticket_type_sale',
        columnNames: ['sale_enabled', 'sale_enabled_from_date', 'sale_enabled_to_date'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'ticket_type',
      new TableIndex({
        name: 'idx_ticket_type_resale',
        columnNames: ['resale_enabled', 'resale_enabled_from_date', 'resale_enabled_to_date'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ticket_type');
  }
}
