import { ApiProperty } from '@nestjs/swagger';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { TicketTypeExistsValidator } from '@admin/ticket-type/validators/ticket-type-exists.validator';
import { UserExistsValidator } from '@admin/user/validators/user-exists.validator';
import { Type } from 'class-transformer';
import { IsUrl, IsInt, IsJSON, IsOptional, IsString, MaxLength, IsEnum, Validate, IsNotEmpty } from 'class-validator';
import { UpdateTicketEventDto } from './update-ticket-event.dto';
import { UpdateTicketTicketTypeDto } from './update-ticket-type.dto';
import { TicketAdditionalData, TicketStatus } from '@app/ticket/ticket.types';

export class UpdateTicketValidationDto {
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
  @IsInt()
  eventId: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
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
  @IsInt()
  @Validate(UserExistsValidator)
  userId: number;

  @ApiProperty({ example: TicketStatus.Active, required: true, default: TicketStatus.Active })
  @IsOptional()
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @ApiProperty({ example: 'event name', required: true })
  @IsOptional()
  @Type(() => UpdateTicketEventDto)
  event: UpdateTicketEventDto;

  @ApiProperty({ example: 'Ticket Type Data', required: true })
  @IsOptional()
  @Type(() => UpdateTicketTicketTypeDto)
  ticketType: UpdateTicketTicketTypeDto;
}
