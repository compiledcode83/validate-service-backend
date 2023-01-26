import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddUserIdToMessageTable1670591916128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'message',
      new TableColumn({
        name: 'user_id',
        type: 'int',
        isNullable: true,
        unsigned: true,
      }),
    );

    await queryRunner.createIndex(
      'message',
      new TableIndex({
        name: 'idx_message_user_id',
        columnNames: ['user_id'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('message', 'user_id');
  }
}
