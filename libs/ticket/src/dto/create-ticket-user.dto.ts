import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketUserDto {
  @ApiProperty({
    example: '28d1b563-eae0-4a5a-84cf-5b8f4b527411',
    required: false,
    description: 'User uuid',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  uuid: string;

  @ApiProperty({ example: 'John Doe', required: false, minimum: 1, maximum: 128, description: 'Full name' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'user@example.com', required: false, maximum: 255, description: 'E-mail' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+17951110000', required: false, description: 'Phone number is E.164 format' })
  @IsPhoneNumber()
  phoneNumber: string;
}
