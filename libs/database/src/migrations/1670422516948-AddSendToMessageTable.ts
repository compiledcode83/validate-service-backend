import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSendToMessageTable1670422516948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'message',
      new TableColumn({
        name: 'send_to',
        type: 'varchar',
        length: '500',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('message', 'send_to');
  }
}
