import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTranslationTables1675932139655 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'translation',
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
            name: 'entity_name',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'entity_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'entity_attribute',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'locale',
            type: 'enum',
            enum: ['en_US', 'pt_BR'],
            default: `'en_US'`,
          },
          {
            name: 'text',
            type: 'text',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'translation',
      new TableIndex({
        name: 'idx_translation_entity',
        columnNames: ['entity_name', 'entity_id', 'entity_attribute', 'locale'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('translation');
  }
}
