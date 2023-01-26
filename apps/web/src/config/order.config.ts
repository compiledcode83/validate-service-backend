import { registerAs } from '@nestjs/config';

export default registerAs('orderConfig', () => ({
  primarySaleReservationMinutes: Number(process.env.ORDER_PRIMARY_RESERVATION_MINUTES),
}));
