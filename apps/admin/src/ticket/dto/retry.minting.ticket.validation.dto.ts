import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Validate } from 'class-validator';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { Type } from 'class-transformer';
import { UserExistsValidator } from '@admin/user/validators/user-exists.validator';

export class RetryTicketMinting {
  @ApiProperty({ example: 1, required: true })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
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

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Validate(UserExistsValidator)
  userId: number;
}
