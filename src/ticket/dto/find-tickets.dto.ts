import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { CursorFilterDto } from '@src/common/pagination/cursor-filter.dto';
import { Ticket } from '../ticket.entity';
import { Type } from 'class-transformer';
import { IsSeedPhrase } from '@src/common/decorators/is-seed-phrase.decorator';

export class FindTicketsDto extends CursorFilterDto {
  @ApiProperty({ example: '8e9c3708-25d8-467f-9a68-00507f8ece4a', required: false })
  @IsOptional()
  @IsUUID()
  userUuid: string;

  @ApiProperty({ example: '8c0d1e373c994bcc0ba983394ba9198236e80a1cd221d89686dfcd31066598d1', required: false })
  @IsOptional()
  @IsSeedPhrase()
  seedPhrase: string;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Ticket = 'createdAt';

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;
}
