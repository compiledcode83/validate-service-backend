import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordToTicketProvider1667210848905 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ticket_provider',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ticket_provider', 'password');
  }
}
