import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class MakeEmailUniqueTicketProvider1667211069489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('ticket_provider', 'idx_ticket_provider_email');

    await queryRunner.createIndex(
      'ticket_provider',
      new TableIndex({
        name: 'idx_ticket_provider_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
