import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { UserExistsByIdentifierValidator } from '@api/user/validators/user-exists-by-identifier.validator';
import { UserExistsByUuidValidator } from '@api/user/validators/user-exists-by-uuid.validator';
import { Allow, IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength, Validate, ValidateIf } from 'class-validator';

export class CreateTicketUserDto {
  @ApiProperty({
    example: '28d1b563-eae0-4a5a-84cf-5b8f4b527411',
    required: false,
    description: 'Existing user uuid',
  })
  @ValidateIf((o) => !o?.name && !o?.email && !o?.phoneNumber)
  @Validate(UserExistsByUuidValidator)
  uuid: string;

  @ApiProperty({ example: 'John Doe', required: false, minimum: 1, maximum: 128, description: 'Full name' })
  @ValidateIf((o) => !o?.uuid)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'user@example.com', required: false, maximum: 255, description: 'E-mail' })
  @ValidateIf((o) => !o?.uuid)
  @IsEmail()
  @MaxLength(255)
  @Validate(UserExistsByIdentifierValidator)
  email: string;

  @ApiProperty({ example: '+17951110000', required: false, description: 'Phone number is E.164 format' })
  @ValidateIf((o) => !o?.uuid)
  @IsPhoneNumber()
  @Validate(UserExistsByIdentifierValidator)
  phoneNumber: string;

  @Allow()
  ticketProvider: TicketProvider;
}
