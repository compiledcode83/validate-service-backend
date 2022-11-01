import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRefreshTokenTable1667220224226 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket_provider_refresh_token',
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
            length: '64',
            isNullable: false,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '1000',
            isNullable: false,
          },
          {
            name: 'fingerprint',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '46',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expire_at',
            type: 'datetime',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'refresh_token',
      new TableIndex({
        name: 'idx_ticket_provider_refresh_token_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'refresh_token',
      new TableIndex({
        name: 'idx_ticket_provider_refresh_token_tp_id',
        columnNames: ['ticket_provider_id'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
