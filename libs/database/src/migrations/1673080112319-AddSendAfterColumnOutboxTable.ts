import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddSendAfterColumnOutboxTable1673080112319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'outbox',
      new TableColumn({
        name: 'send_after',
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    await queryRunner.createIndex(
      'outbox',
      new TableIndex({
        name: 'idx_outbox_status_send_after',
        columnNames: ['status', 'send_after'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('outbox', 'send_after');
  }
}
