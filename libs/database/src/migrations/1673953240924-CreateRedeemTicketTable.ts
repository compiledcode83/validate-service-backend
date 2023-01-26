import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRedeemTicketTable1673953240924 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'redeem_ticket',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            unsigned: true,
            generationStrategy: 'increment',
          },
          {
            name: 'redeem_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'ticket_id',
            type: 'int',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'redeem_ticket',
      new TableIndex({
        name: 'idx_redeem_ticket_redeem_id',
        columnNames: ['redeem_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'redeem_ticket',
      new TableIndex({
        name: 'idx_redeem_ticket_ticket_id',
        columnNames: ['ticket_id'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('redeem_ticket');
  }
}
