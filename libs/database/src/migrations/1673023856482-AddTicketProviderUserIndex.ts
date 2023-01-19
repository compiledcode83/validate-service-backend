import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddTicketProviderUserIndex1673023856482 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_ticket_provider_phone_number',
        columnNames: ['ticket_provider_id', 'phone_number'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('user', 'idx_user_ticket_provider_phone_number');
  }
}
