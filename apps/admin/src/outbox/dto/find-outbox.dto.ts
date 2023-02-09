import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsIn, IsInt, Min, Max, IsString, IsEnum, IsUUID } from 'class-validator';
import { Outbox } from '@app/outbox/outbox.entity';
import { OutboxStatus } from '@app/outbox/outbox.types';

export class FindOutboxDto extends CursorFilterDto {
  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Outbox = 'createdAt';

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;

  @ApiProperty({ example: 'Name of Event', minimum: 1, required: false })
  @Type(() => String)
  @IsOptional()
  @IsString()
  eventName: string;

  @ApiProperty({ example: OutboxStatus.Created, enum: OutboxStatus, required: false })
  @IsOptional()
  @IsEnum(OutboxStatus)
  status: OutboxStatus;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  operationUuid: string;
}
