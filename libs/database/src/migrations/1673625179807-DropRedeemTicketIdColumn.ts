import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRedeemTicketIdColumn1673625179807 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('redeem', 'ticket_id');
  }

  public async down(): Promise<void> {
    return;
  }
}
