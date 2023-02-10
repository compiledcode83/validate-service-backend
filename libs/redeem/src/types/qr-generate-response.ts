import { ApiProperty } from '@nestjs/swagger';

export class QrGenerateResponse {
  @ApiProperty({ example: '11bf5b37', description: 'QR code hash' })
  qrHash: string;

  @ApiProperty({ example: 30, description: 'Current QR hash time to live (in sec)' })
  qrHashTtl: number;

  @ApiProperty({ example: 1800, description: 'The QR code display time to live (in sec)' })
  qrDisplayTtl: number;
}
