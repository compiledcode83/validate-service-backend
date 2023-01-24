import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUpdatedAtColumnInListingTable1672214412713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'listing',
      new TableColumn({
        name: 'updated_at',
        type: 'datetime',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
