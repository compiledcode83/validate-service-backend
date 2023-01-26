import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength, Validate, ValidateIf } from 'class-validator';
import { UserExistsValidator } from '@admin/user/validators/user-exists.validator';
import { UserExistsValidatorByIdentifier } from '@admin/user/validators/user-exists-by-identifier.validator';

export class CreateTicketUserDto {
  @ApiProperty({
    example: '28d1b563-eae0-4a5a-84cf-5b8f4b527411',
    required: false,
    description: 'Existing user uuid',
  })
  @ValidateIf((o) => !o?.name && !o?.email && !o?.phoneNumber)
  @Validate(UserExistsValidator)
  userId: number;

  @ApiProperty({ example: 'John Doe', required: false, minimum: 1, maximum: 128, description: 'Full name' })
  @ValidateIf((o) => !o?.userId)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'user@example.com', required: false, maximum: 255, description: 'E-mail' })
  @ValidateIf((o) => !o?.userId)
  @IsEmail()
  @MaxLength(255)
  @Validate(UserExistsValidatorByIdentifier)
  email: string;

  @ApiProperty({ example: '+17951110000', required: false, description: 'Phone number is E.164 format' })
  @ValidateIf((o) => !o?.userId)
  @IsPhoneNumber()
  @Validate(UserExistsValidatorByIdentifier)
  phoneNumber: string;
}
