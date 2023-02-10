import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsJSON, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { TicketAdditionalData, TicketStatus } from '@app/ticket/ticket.types';
import { CreateTicketDto as CommonCreateTicketDto } from '@app/ticket/dto/create-ticket.dto';

export class CreateTicketValidationDto extends CommonCreateTicketDto {
  @ApiProperty({
    example: '2025-06-24',
    required: false,
    description: 'Ticket end date',
  })
  @IsOptional()
  dateStart: string;

  @ApiProperty({
    example: 'https://img.new.livestream.com/events/00000000004f5dbd/7ffdcd50-2e4b-497a-acca-bc33070c3e12.jpg',
    required: false,
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  imageUrl: string;

  @ApiProperty({
    example: '{ "id": 0 }',
    required: false,
  })
  @IsOptional()
  @IsJSON()
  additionalData: TicketAdditionalData;

  @ApiProperty({
    example: 'abcdefghi',
    required: false,
    maxLength: 64,
  })
  @MaxLength(64)
  @IsOptional()
  @IsString()
  contractId: string;

  @ApiProperty({
    example: 'abcdefghi',
    required: false,
    maxLength: 2048,
  })
  @MaxLength(2048)
  @IsOptional()
  @IsUrl()
  ipfsUri: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  tokenId: number;

  @ApiProperty({ example: TicketStatus.Active, required: true, default: TicketStatus.Active })
  @IsOptional()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
