import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  secret: process.env.JWT_SECRET,
  refreshTokenCookieDomain: process.env.JWT_REFRESH_TOKEN_COOKIE_DOMAIN,
  refreshTokenDurationDays: process.env.JWT_REFRESH_TOKEN_DURATION_DAYS,
  refreshTokenMaxSessions: process.env.JWT_REFRESH_TOKEN_MAX_SESSIONS,
  accessTokenDurationMinutes: process.env.JWT_ACCESS_TOKEN_DURATION_MINUTES,
}));
