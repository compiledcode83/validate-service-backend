import { TicketStatus } from '@src/ticket/ticket.types';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTicketStatusDeleted1666357731595 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'ticket',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(TicketStatus),
        default: `'${TicketStatus.Creating}'`,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
