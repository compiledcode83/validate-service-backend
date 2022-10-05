import { ApiProperty } from '@nestjs/swagger';
import { IsSeedPhrase } from '@src/common/decorators/is-seed-phrase.decorator';

export class FindUserBySeedPhraseDto {
  @ApiProperty({ example: '8c0d1e373c994bcc0ba983394ba9198236e80a1cd221d89686dfcd31066598d1', required: true })
  @IsSeedPhrase()
  seedPhrase: string;
}
