import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MarketType } from '@app/common/types/market-type.enum';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { Event } from '@app/event/event.entity';

export class FindEventsDto extends CursorFilterDto {
  @ApiProperty({ example: MarketType.Primary, required: true })
  @IsEnum(MarketType)
  marketType: MarketType;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Event = 'createdAt';

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;
}
