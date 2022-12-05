import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEventIdColumnToTicketTable1670104310377 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ticket',
      new TableColumn({
        name: 'event_id',
        type: 'int',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('admin_refresh_token', 'user_agent');
  }
}
