import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDeprecatedColumns1668091145801 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'seed_phrase');
  }

  public async down(): Promise<void> {
    return;
  }
}
