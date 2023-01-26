import { UserStatus } from '@app/user/user.types';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserTable1664198326986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
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
            name: 'phone_number',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'wallet_address',
            type: 'varchar',
            length: '255',
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
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(UserStatus),
            default: `'${UserStatus.Creating}'`,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_wallet_address',
        columnNames: ['wallet_address'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_ticket_provider_id',
        columnNames: ['ticket_provider_id'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
