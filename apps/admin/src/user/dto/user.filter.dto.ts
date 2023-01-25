import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { ValidateHelper } from '@app/common/helpers/validate-helper';
import { User } from '@app/user/user.entity';

export class UserFilterDto extends CursorFilterDto {
  @ApiProperty({ example: 'adam', required: false })
  @Transform(({ value }) => ValidateHelper.sanitize(value))
  @IsOptional()
  @IsString()
  searchText: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ticketProviderId: number;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof User = 'createdAt';
}
