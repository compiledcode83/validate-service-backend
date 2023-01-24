import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { UserExistsByUuidValidator } from '../validators/user-exists-by-uuid.validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: true, minimum: 1, maximum: 128, description: 'Full name' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'user@example.com', required: true, maximum: 255, description: 'E-mail' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Validate(UserExistsByUuidValidator)
  uuid: string;
}
