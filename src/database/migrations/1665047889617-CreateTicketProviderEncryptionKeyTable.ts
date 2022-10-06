import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTicketProviderEncryptionKeyTable1665047889617 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_provider_encryption_key',
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
            name: 'secret_key',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'int',
            unsigned: true,
            default: 1,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ticket_provider_encryption_key',
      new TableIndex({
        name: 'idx_ticket_provider_encryption_key_tp_version',
        columnNames: ['ticket_provider_id', 'version'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ticket_provider_encryption_key');
  }
}
