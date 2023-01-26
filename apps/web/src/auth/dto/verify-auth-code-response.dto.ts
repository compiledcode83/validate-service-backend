import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/user/user.entity';
import { TokensResponseDto } from './tokens-response.dto';

export class VerifyAuthCodeResponseDto {
  @ApiProperty({ type: User })
  user: User;

  @ApiProperty({ type: TokensResponseDto })
  tokens: TokensResponseDto;

  @ApiProperty({ example: true })
  hasToCompleteProfile: boolean;
}
