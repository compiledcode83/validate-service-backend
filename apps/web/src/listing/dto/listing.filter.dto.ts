import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min, Validate } from 'class-validator';
import { Listing } from '../../../../../libs/listing/src/listing.entity';
import { EventExistsValidator } from '@web/event/validators/event-exists.validator';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';

export class ListingDto extends CursorFilterDto {
  @ApiProperty({ example: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000', required: false })
  @IsUUID()
  @Validate(EventExistsValidator)
  eventUuid: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 25, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  @IsOptional()
  limit = 25;

  @ApiProperty({
    example: 'createdAt',
    enum: ['createdAt'],
    required: false,
  })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Listing = 'createdAt';
}
