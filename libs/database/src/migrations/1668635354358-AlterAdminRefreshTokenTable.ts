import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAdminRefreshTokenTable1668635354358 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'admin_refresh_token',
      new TableColumn({
        name: 'user_agent',
        type: 'varchar',
        length: '1000',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'admin_refresh_token',
      new TableColumn({
        name: 'fingerprint',
        type: 'varchar',
        length: '64',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'admin_refresh_token',
      new TableColumn({
        name: 'ip',
        type: 'varchar',
        length: '46',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('admin_refresh_token', 'user_agent');
    await queryRunner.dropColumn('admin_refresh_token', 'fingerprint');
    await queryRunner.dropColumn('admin_refresh_token', 'ip');
  }
}
