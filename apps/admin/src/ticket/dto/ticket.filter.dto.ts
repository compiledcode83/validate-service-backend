import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidateHelper } from '@app/common/helpers/validate-helper';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';

export class TicketFilterDto extends CursorFilterDto {
  @ApiProperty({ example: 'platinum', required: false })
  @Transform(({ value }) => ValidateHelper.sanitize(value))
  @IsOptional()
  @IsString()
  searchText: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ticketProviderId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId: number;
}
