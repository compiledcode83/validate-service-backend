import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddListingUuidColumn1672129993259 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('listing', [
      new TableColumn({
        name: 'uuid',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
