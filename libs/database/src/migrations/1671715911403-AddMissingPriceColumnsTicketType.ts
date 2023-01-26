import { CurrencyEnum } from '@app/common/types/currency.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMissingPriceColumnsTicketType1671715911403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('ticket_type', [
      new TableColumn({
        name: 'sale_price',
        type: 'DECIMAL(12,2)',
        isNullable: true,
      }),
      new TableColumn({
        name: 'sale_currency',
        type: 'enum',
        enum: Object.values(CurrencyEnum),
      }),
      new TableColumn({
        name: 'resale_currency',
        type: 'enum',
        enum: Object.values(CurrencyEnum),
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
