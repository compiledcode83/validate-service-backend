import { CurrencyEnum } from '@app/common/types/currency.enum';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOrderTables1671702283663 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order',
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
            name: 'market_type',
            type: 'enum',
            enum: ['primary', 'secondary'],
            isNullable: false,
          },
          {
            name: 'buyer_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'seller_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'sale_price',
            type: 'DECIMAL(12,2)',
            isNullable: true,
          },
          {
            name: 'sale_currency',
            type: 'enum',
            enum: Object.values(CurrencyEnum),
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
            name: 'reserved_until',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['created', 'paid', 'completed', 'canceled'],
            default: `'created'`,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'idx_order_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'idx_order_seller',
        columnNames: ['seller_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'idx_order_buyer',
        columnNames: ['buyer_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_primary',
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
            name: 'order_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'ticket_type_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'quantity',
            type: 'int',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order_primary',
      new TableIndex({
        name: 'idx_order_primary_order_id',
        columnNames: ['order_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_primary_ticket',
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
            name: 'order_primary_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'ticket_id',
            type: 'int',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order_primary_ticket',
      new TableIndex({
        name: 'idx_order_primary_ticket_primary_id',
        columnNames: ['order_primary_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_secondary',
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
            name: 'order_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'listing_id',
            type: 'int',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order_secondary',
      new TableIndex({
        name: 'idx_order_secondary_order_id',
        columnNames: ['order_id'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
