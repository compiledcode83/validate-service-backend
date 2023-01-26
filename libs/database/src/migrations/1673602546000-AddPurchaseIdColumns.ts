import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddPurchaseIdColumns1673602546000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ticket',
      new TableColumn({
        name: 'purchase_id',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'redeem',
      new TableColumn({
        name: 'purchase_id',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'message',
      new TableColumn({
        name: 'purchase_id',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'ticket',
      new TableIndex({
        name: 'idx_ticket_purchase_id',
        columnNames: ['purchase_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'redeem',
      new TableIndex({
        name: 'idx_redeem_purchase_id',
        columnNames: ['purchase_id'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
