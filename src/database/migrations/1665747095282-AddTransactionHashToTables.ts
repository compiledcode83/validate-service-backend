import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTransactionHashToTables1665747095282 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('ticket', [
      new TableColumn({
        name: 'transaction_hash',
        type: 'varchar',
        length: '66',
        isNullable: true,
      }),
    ]);

    await queryRunner.addColumns('ticket_transfer', [
      new TableColumn({
        name: 'transaction_hash',
        type: 'varchar',
        length: '66',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ticket', 'transaction_hash');
    await queryRunner.dropColumn('ticket_transfer', 'transaction_hash');
  }
}
