import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUserTable1673016595845 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user',
      'name',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '128',
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn(
      'user',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
