import { TicketProviderUserIdentifier } from '@src/ticket-provider/ticket-provider.types';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserUniqueIdentifiedColumn1664974566802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('ticket_provider', [
      new TableColumn({
        name: 'user_identifier',
        type: 'enum',
        enum: Object.values(TicketProviderUserIdentifier),
        default: `'${TicketProviderUserIdentifier.PhoneNumber}'`,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ticket_provider', 'user_identifier');
  }
}
