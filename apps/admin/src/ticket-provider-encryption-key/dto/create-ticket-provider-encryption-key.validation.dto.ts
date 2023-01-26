import { ApiProperty } from '@nestjs/swagger';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Validate } from 'class-validator';

export class CreateTicketProviderEncryptionKeyValidationDto {
  @ApiProperty({ example: 2, required: true })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Validate(TicketProviderExistsValidator)
  ticketProviderId: number;
}
