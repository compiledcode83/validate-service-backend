import { TicketStatus } from '@src/ticket/ticket.types';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTicketTable1664523818172 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket',
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
            name: 'user_id',
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
            name: 'image_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'additional_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'ticket_provider_id',
            type: 'int',
            unsigned: true,
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
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(TicketStatus),
            default: `'${TicketStatus.Creating}'`,
          },
          {
            name: 'contract_id',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'token_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'ipfs_uri',
            type: 'varchar',
            length: '128',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ticket',
      new TableIndex({
        name: 'idx_ticket_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket',
      new TableIndex({
        name: 'idx_ticket_ticket_provider_id',
        columnNames: ['ticket_provider_id'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ticket');
  }
}
