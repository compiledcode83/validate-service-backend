import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';

export class CreateEventDto {
  @ApiProperty({ example: 'John Doe Event Name', required: true })
  @IsString()
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'John Doe Event Description', required: true })
  @IsString()
  @MaxLength(128)
  description: string;

  @ApiProperty({ example: 'Image Url', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'JohnDoe Event', required: true })
  @Type(() => Number)
  @Validate(TicketProviderExistsValidator)
  @IsInt()
  ticketProviderId: number;
}
