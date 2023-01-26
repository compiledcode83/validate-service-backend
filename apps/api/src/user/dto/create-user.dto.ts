import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Allow, IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { UserExistsByIdentifierValidator } from '../validators/user-exists-by-identifier.validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', required: false, minimum: 1, maximum: 128, description: 'Full name' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'user@example.com', required: false, maximum: 255, description: 'E-mail' })
  @IsEmail()
  @MaxLength(255)
  @Validate(UserExistsByIdentifierValidator)
  email: string;

  @ApiProperty({ example: '+17951110000', required: false, description: 'Phone number is E.164 format' })
  @IsPhoneNumber()
  @Validate(UserExistsByIdentifierValidator)
  phoneNumber: string;

  @Allow()
  ticketProvider: TicketProvider;
}
