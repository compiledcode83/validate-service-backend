import { Global, Module } from '@nestjs/common';
import { TranslationRepository } from './translation.repository';
import { TranslationService } from './translation.service';

@Global()
@Module({
  providers: [TranslationService, TranslationRepository],
  exports: [TranslationService],
})
export class TranslationModule {}
