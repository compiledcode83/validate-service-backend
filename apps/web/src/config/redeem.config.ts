import { registerAs } from '@nestjs/config';

export default registerAs('redeemConfig', () => ({
  redeemCodeExpireMinutes: Number(process.env.REDEEM_CODE_EXPIRE_MINUTES),
  redeemLimitPerHour: Number(process.env.REDEEM_LIMIT_PER_HOUR),
  redeemVerifyCodeMin: Number(process.env.REDEEM_VERIFY_CODE_MIN),
  redeemVerifyCodeMax: Number(process.env.REDEEM_VERIFY_CODE_MAX),
  redeemQrHashTtl: Number(process.env.REDEEM_QR_HASH_TTL),
  redeemQrDisplayTtl: Number(process.env.REDEEM_QR_DISPLAY_TTL),
  redeemQrHashLength: Number(process.env.REDEEM_QR_HASH_LENGTH),
}));
