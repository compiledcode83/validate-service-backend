import { TicketProviderStatus } from '@src/ticket-provider/ticket-provider.types';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTicketProviderTable1663674471994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_provider',
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
            name: 'name',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
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
            name: 'status',
            type: 'enum',
            enum: Object.values(TicketProviderStatus),
            default: `'${TicketProviderStatus.Active}'`,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ticket_provider',
      new TableIndex({
        name: 'idx_ticket_provider_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket_provider',
      new TableIndex({
        name: 'idx_ticket_provider_email',
        columnNames: ['email'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ticket_provider');
  }
}
