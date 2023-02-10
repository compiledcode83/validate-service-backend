import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class CancelListingDto {
  @ApiProperty({ example: 'abscfsad', required: false })
  @Type(() => String)
  @IsUUID()
  listingUuid: string;

  @ApiProperty({ example: 'abscfsad', required: false })
  @Type(() => String)
  @IsUUID()
  userUuid: string;
}
