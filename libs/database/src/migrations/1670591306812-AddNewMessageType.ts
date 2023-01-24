import { MessageType } from '@app/message/message.types';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewMessageType1670591306812 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'message',
      'type',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: Object.values(MessageType),
        default: `'${MessageType.RedeemCode}'`,
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
