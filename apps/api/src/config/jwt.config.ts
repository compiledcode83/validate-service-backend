import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  secret: process.env.API_JWT_SECRET,
  refreshTokenCookieDomain: process.env.API_JWT_REFRESH_TOKEN_COOKIE_DOMAIN,
  refreshTokenCookieSecure: process.env.API_JWT_REFRESH_TOKEN_COOKIE_SECURE === 'true',
  refreshTokenCookieHttpOnly: process.env.API_JWT_REFRESH_TOKEN_COOKIE_HTTPONLY === 'true',
  refreshTokenDurationDays: process.env.API_JWT_REFRESH_TOKEN_DURATION_DAYS,
  refreshTokenMaxSessions: process.env.API_JWT_REFRESH_TOKEN_MAX_SESSIONS,
  accessTokenDurationMinutes: process.env.API_JWT_ACCESS_TOKEN_DURATION_MINUTES,
}));
