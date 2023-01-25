import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { ValidateHelper } from '@app/common/helpers/validate-helper';
import { TicketProviderStatus } from '@app/ticket-provider/ticket-provider.types';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';

export class TicketProviderFilterDto extends CursorFilterDto {
  @ApiProperty({ example: 'platinum', required: false })
  @Transform(({ value }) => ValidateHelper.sanitize(value))
  @IsOptional()
  @IsString()
  searchText: string;

  @ApiProperty({ example: TicketProviderStatus.Active, required: false })
  @IsOptional()
  @IsEnum(TicketProviderStatus)
  status: TicketProviderStatus;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof TicketProvider = 'createdAt';
}
