import { registerAs } from '@nestjs/config';

export default registerAs('authConfig', () => ({
  authCodeMin: Number(process.env.APP_AUTH_CODE_MIN),
  authCodeMax: Number(process.env.APP_AUTH_CODE_MAX),
  authCodeTtlMinutes: process.env.APP_AUTH_CODE_TTL_MINUTES,
  authCodeFakeGenerator: process.env.APP_AUTH_CODE_FAKE_GENERATOR === 'true',
}));
