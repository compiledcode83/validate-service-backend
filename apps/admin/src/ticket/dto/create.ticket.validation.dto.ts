import { ApiProperty } from '@nestjs/swagger';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { TicketTypeExistsValidator } from '@admin/ticket-type/validators/ticket-type-exists.validator';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { CreateTicketUserDto } from './create-ticket-user.dto';
import { TicketAdditionalData, TicketStatus } from '@app/ticket/ticket.types';

export class CreateTicketValidationDto {
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

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Validate(TicketProviderExistsValidator)
  ticketProviderId: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  @Validate(TicketTypeExistsValidator)
  ticketTypeUuid: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  eventId: number;

  @ApiProperty({
    example: { name: 'John doe', phoneNumber: '+17951110000', email: 'user@example.com' },
    required: true,
    description: `Create new user with the ticket`,
  })
  @Type(() => CreateTicketUserDto)
  @ValidateNested()
  user: CreateTicketUserDto;

  @ApiProperty({ example: TicketStatus.Active, required: true, default: TicketStatus.Active })
  @IsOptional()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
