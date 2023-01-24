import { RedeemStatus } from '@src/redeem/redeem.types';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateReedeemTable1667827284664 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'redeem',
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
            name: 'ticket_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'user_id',
            type: 'int',
            unsigned: true,
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
            name: 'user_agent',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(RedeemStatus),
            default: `'${RedeemStatus.NotRedeemed}'`,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'redeem',
      new TableIndex({
        name: 'idx_redeem_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'redeem',
      new TableIndex({
        name: 'idx_redeem_ticket_id',
        columnNames: ['ticket_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'redeem',
      new TableIndex({
        name: 'idx_redeem_user_id',
        columnNames: ['user_id'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
