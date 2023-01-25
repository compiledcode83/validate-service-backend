import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { TicketExistsValidator } from '@admin/ticket/validators/ticket-exists-validator';
import { UserExistsValidator } from '@admin/user/validators/user-exists.validator';

export class CreateTicketTransferDto {
  @ApiProperty({
    example: 1,
    required: true,
    description: `New ticket owner Id`,
  })
  @Type(() => Number)
  @IsInt()
  @Validate(UserExistsValidator)
  userId: number;

  @ApiProperty({
    example: 1,
    required: true,
    description: `Ticket Id`,
  })
  @IsInt()
  @Validate(TicketExistsValidator)
  ticketId: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Validate(TicketProviderExistsValidator)
  ticketProviderId: number;
}
