import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAdminRefreshToken1668164280435 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admin_refresh_token',
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
            name: 'admin_id',
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
      'admin_refresh_token',
      new TableIndex({
        name: 'idx_admin_refresh_token_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'admin_refresh_token',
      new TableIndex({
        name: 'idx_admin_refresh_token_tp_id',
        columnNames: ['admin_id'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
