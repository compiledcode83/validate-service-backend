import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ example: 'F?2BVjaxNR-&hn%', required: true })
  refreshToken: string;
}
