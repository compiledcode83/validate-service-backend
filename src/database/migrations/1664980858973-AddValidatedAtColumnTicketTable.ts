import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddValidatedAtColumnTicketTable1664980858973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('ticket', [
      new TableColumn({
        name: 'validated_at',
        type: 'datetime',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ticket', 'validated_at');
  }
}
