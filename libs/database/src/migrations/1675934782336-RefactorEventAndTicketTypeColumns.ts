import { EventWeekday } from '@app/event/event.types';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RefactorEventAndTicketTypeColumns1675934782336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('event', ['name', 'description']);
    await queryRunner.dropColumns('ticket_type', ['name', 'description']);

    await queryRunner.addColumns('event', [
      new TableColumn({
        name: 'location_name',
        type: 'varchar',
        length: '512',
        isNullable: true,
      }),
      new TableColumn({
        name: 'location_url',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_start',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_end',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'time_start',
        type: 'time',
        isNullable: true,
      }),
      new TableColumn({
        name: 'weekday',
        type: 'enum',
        enum: Object.values(EventWeekday),
        isNullable: true,
      }),
      new TableColumn({
        name: 'social_twitter',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'social_instagram',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'social_facebook',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'info',
        type: 'json',
        isNullable: true,
      }),
    ]);

    await queryRunner.addColumns('ticket_type', [
      new TableColumn({
        name: 'date_start',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_end',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'time_start',
        type: 'time',
        isNullable: true,
      }),
      new TableColumn({
        name: 'weekday',
        type: 'enum',
        enum: Object.values(EventWeekday),
        isNullable: true,
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
