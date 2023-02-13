import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Translation } from './translation.entity';

@Injectable()
export class TranslationRepository extends Repository<Translation> {
  constructor(public readonly dataSource: DataSource) {
    super(Translation, dataSource.manager);
  }
}
