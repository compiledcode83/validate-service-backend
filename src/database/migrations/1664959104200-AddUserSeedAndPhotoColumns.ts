import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddUserSeedAndPhotoColumns1664959104200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'seed_phrase',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
      new TableColumn({
        name: 'photo_url',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_seed_phrase',
        columnNames: ['seed_phrase'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('user', ['seed_phrase', 'photo_url']);
  }
}
