import { MessageChannel, MessageStatus, MessageType } from '@src/message/message.types';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMessageTable1667834676371 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'message',
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
            name: 'uuid',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'ticket_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'redeem_id',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: Object.values(MessageType),
            default: `'${MessageType.RedeemCode}'`,
          },
          {
            name: 'channel',
            type: 'enum',
            enum: Object.values(MessageChannel),
            default: `'${MessageChannel.SMS}'`,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(MessageStatus),
            default: `'${MessageStatus.Created}'`,
          },
          {
            name: 'error_data',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'message',
      new TableIndex({
        name: 'idx_message_uuid',
        columnNames: ['uuid'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'message',
      new TableIndex({
        name: 'idx_message_ticket_id',
        columnNames: ['ticket_id'],
        isUnique: false,
      }),
    );

    await queryRunner.createIndex(
      'message',
      new TableIndex({
        name: 'idx_message_redeem_id',
        columnNames: ['redeem_id'],
        isUnique: false,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
