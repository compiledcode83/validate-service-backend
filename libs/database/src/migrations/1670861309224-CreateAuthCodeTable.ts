import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuthCodeTable1670861309224 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_code',
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
            name: 'user_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'code',
            type: 'int',
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
          {
            name: 'used_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'auth_code',
      new TableIndex({
        name: 'idx_auth_code_user_id',
        columnNames: ['user_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'auth_code',
      new TableIndex({
        name: 'idx_auth_code_phone_code_expire_used',
        columnNames: ['phone_number', 'code', 'expire_at', 'used_at'],
        isUnique: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
