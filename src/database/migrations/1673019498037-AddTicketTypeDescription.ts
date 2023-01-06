import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTicketTypeDescription1673019498037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('ticket_type', [
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ticket_type', 'description');
  }
}
