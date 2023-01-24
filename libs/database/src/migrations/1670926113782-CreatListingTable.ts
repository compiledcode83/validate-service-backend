import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { ListingStatus } from '@app/listing/listing.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';

export class CreatListingTable1670926113779 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'listing',
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
            name: 'ticket_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'event_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'ends_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'buy_now_price',
            type: 'DECIMAL(12,2)',
            isNullable: false,
          },
          {
            name: 'buy_now_currency',
            type: 'enum',
            enum: Object.values(CurrencyEnum),
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(ListingStatus),
            default: `'${ListingStatus.Active}'`,
          },
          {
            name: 'market_type',
            type: 'varchar',
            isNullable: false,
            length: '36',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('listing');
  }
}
