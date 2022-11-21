import { ConfigService } from '@nestjs/config';
import { default as Redis } from 'ioredis';
import { REDIS_PROVIDER_TOKEN } from './redis.types';

export const RedisProvider = {
  provide: REDIS_PROVIDER_TOKEN,
  useFactory: async (configService: ConfigService): Promise<Redis> =>
    new Redis({
      host: configService.get('redisConfig.host'),
      port: Number(configService.get('redisConfig.port')),
      password: String(configService.get('redisConfig.password')),
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    }),
  inject: [ConfigService],
};
