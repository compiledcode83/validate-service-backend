import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Allow, IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength, Validate, ValidateIf } from 'class-validator';
import { UserExistsByUuidValidator } from '../validators/user-exists-by-uuid.validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false, minimum: 1, maximum: 128, description: 'Full name' })
  @ValidateIf((o) => (!o?.email && !o?.phoneNumber) || o?.name)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'user@example.com', required: false, maximum: 255, description: 'E-mail' })
  @ValidateIf((o) => (!o?.name && !o?.phoneNumber) || o?.email)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+17951110000', required: false, description: 'Phone number is E.164 format' })
  @ValidateIf((o) => (!o?.email && !o?.name) || o?.phoneNumber)
  @IsPhoneNumber()
  phoneNumber: string;

  @Validate(UserExistsByUuidValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
