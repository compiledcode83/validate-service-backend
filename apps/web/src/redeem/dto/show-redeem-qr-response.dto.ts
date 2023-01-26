import { ApiProperty } from '@nestjs/swagger';
import { TicketRedeemDto } from './ticket-redeem.dto';

export class ShowRedeemQrResponseDto {
  @ApiProperty({ example: '11bf5b37', description: 'QR code hash' })
  qrHash: string;

  @ApiProperty({ example: 30, description: 'Current QR hash time to live (in sec)' })
  qrHashTtl: number;

  @ApiProperty({ example: 1800, description: 'The QR code display time to live (in sec)' })
  qrDisplayTtl: number;

  @ApiProperty({ type: TicketRedeemDto, required: false, isArray: true })
  tickets: TicketRedeemDto[];
}
