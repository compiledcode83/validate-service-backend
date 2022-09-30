import { TicketTransferStatus } from '@src/ticket-transfer/ticket-transfer.types';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTicketTransferTable1664532445192 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_transfer',
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
            name: 'user_id_from',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'user_id_to',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'ticket_id',
            type: 'int',
            unsigned: true,
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
            name: 'finished_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(TicketTransferStatus),
            default: `'${TicketTransferStatus.InProgress}'`,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ticket_transfer',
      new TableIndex({
        name: 'idx_ticket_transfer_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket_transfer',
      new TableIndex({
        name: 'idx_ticket_transfer_ticket_provider_id',
        columnNames: ['ticket_provider_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'ticket_transfer',
      new TableIndex({
        name: 'idx_ticket_transfer_ticket_id',
        columnNames: ['ticket_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'ticket_transfer',
      new TableIndex({
        name: 'idx_ticket_transfer_user_id_from',
        columnNames: ['user_id_from'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'ticket_transfer',
      new TableIndex({
        name: 'idx_ticket_transfer_user_id_to',
        columnNames: ['user_id_to'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ticket_transfer');
  }
}
