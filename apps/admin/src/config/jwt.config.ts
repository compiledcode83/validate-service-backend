import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  secret: process.env.ADMIN_JWT_SECRET,
  refreshTokenCookieDomain: process.env.ADMIN_JWT_REFRESH_TOKEN_COOKIE_DOMAIN,
  refreshTokenCookieSecure: process.env.ADMIN_JWT_REFRESH_TOKEN_COOKIE_SECURE === 'true',
  refreshTokenCookieHttpOnly: process.env.ADMIN_JWT_REFRESH_TOKEN_COOKIE_HTTPONLY === 'true',
  refreshTokenDurationDays: process.env.ADMIN_JWT_REFRESH_TOKEN_DURATION_DAYS,
  refreshTokenMaxSessions: process.env.ADMIN_JWT_REFRESH_TOKEN_MAX_SESSIONS,
  accessTokenDurationMinutes: process.env.ADMIN_JWT_ACCESS_TOKEN_DURATION_MINUTES,
}));
