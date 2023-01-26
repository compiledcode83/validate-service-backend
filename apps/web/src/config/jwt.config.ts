import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  secret: process.env.WEB_JWT_SECRET,
  refreshTokenCookieDomain: process.env.WEB_JWT_REFRESH_TOKEN_COOKIE_DOMAIN,
  refreshTokenCookieSecure: process.env.WEB_JWT_REFRESH_TOKEN_COOKIE_SECURE === 'true',
  refreshTokenCookieHttpOnly: process.env.JWEB_WT_REFRESH_TOKEN_COOKIE_HTTPONLY === 'true',
  refreshTokenDurationDays: process.env.WEB_JWT_REFRESH_TOKEN_DURATION_DAYS,
  refreshTokenMaxSessions: process.env.WEB_JWT_REFRESH_TOKEN_MAX_SESSIONS,
  accessTokenDurationMinutes: process.env.WEB_JWT_ACCESS_TOKEN_DURATION_MINUTES,
}));
