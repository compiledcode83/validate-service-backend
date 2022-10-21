import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSecurityLevelToTicketProvider1666272677561 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ticket_provider',
      new TableColumn({
        name: 'security_level',
        type: 'tinyint',
        default: 1,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
