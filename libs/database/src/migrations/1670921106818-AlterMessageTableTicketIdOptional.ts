import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterMessageTableTicketIdOptional1670921106818 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'message',
      'ticket_id',
      new TableColumn({
        name: 'ticket_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
