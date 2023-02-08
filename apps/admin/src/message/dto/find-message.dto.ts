import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsIn, IsInt, Min, Max, IsString } from 'class-validator';
import { Message } from '@app/message/message.entity';
import { ValidateHelper } from '@app/common/helpers/validate-helper';

export class FindMessageDto extends CursorFilterDto {
  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Message = 'createdAt';

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;

  @ApiProperty({ example: '+1***********', required: false })
  @Transform(({ value }) => ValidateHelper.sanitize(value))
  @IsOptional()
  @IsString()
  userPhoneNumber: string;
}
