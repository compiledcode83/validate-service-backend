import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOrderPaymentTable1671979831211 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_payment',
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
            name: 'external_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'external_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'external_status',
            type: 'enum',
            default: `'pending'`,
            enum: ['pending', 'completed', 'declined', 'error'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order_payment',
      new TableIndex({
        name: 'idx_order_payment_order_id',
        columnNames: ['order_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'order_payment',
      new TableIndex({
        name: 'idx_order_payment_order_external',
        columnNames: ['order_id', 'external_id'],
        isUnique: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
