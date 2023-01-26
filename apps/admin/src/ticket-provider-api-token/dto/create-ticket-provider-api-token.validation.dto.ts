import { ApiProperty } from '@nestjs/swagger';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Validate } from 'class-validator';

export class CreateTicketProviderApiTokenValidationDto {
  @ApiProperty({ example: 'abcs67ur#n(9885j3S', required: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  token: string;

  @ApiProperty({ example: 2, required: true })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Validate(TicketProviderExistsValidator)
  ticketProviderId: number;
}
