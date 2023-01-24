import { ApiProperty } from '@nestjs/swagger';

export class PublicKeyResponse {
  @ApiProperty({ example: '11bf5b37', required: true })
  key: string;
}
