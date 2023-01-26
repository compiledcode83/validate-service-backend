import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReedemModeColumn1673616981417 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'redeem',
      new TableColumn({
        name: 'mode',
        type: 'enum',
        enum: ['individual', 'all'],
        default: `'individual'`,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
