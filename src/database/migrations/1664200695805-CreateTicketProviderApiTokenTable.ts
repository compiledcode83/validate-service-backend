import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTicketProviderApiTokenTable1664200695805 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_provider_api_token',
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
            name: 'ticket_provider_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'last_used_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ticket_provider_api_token',
      new TableIndex({
        name: 'idx_ticket_provider_api_token_tp_id',
        columnNames: ['ticket_provider_id'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ticket_provider_api_token');
  }
}
