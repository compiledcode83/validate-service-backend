import { Inject, Injectable } from '@nestjs/common';
import Redis, { Result } from 'ioredis';
import { REDIS_PROVIDER_TOKEN } from './redis.types';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_PROVIDER_TOKEN) private redis: Redis) {}

  async get(key: string): Promise<Result<string | null, any>> {
    return this.redis.get(key);
  }

  async set(key: string, value: string | number, expireInSec: number): Promise<Result<'OK', any>> {
    return this.redis.set(key, value, 'EX', expireInSec);
  }

  async delete(key: string): Promise<Result<number, any>> {
    return this.redis.del(key);
  }

  async getMany(keys: string[]): Promise<Result<(string | null)[], any>> {
    return this.redis.mget(keys);
  }

  async incr(key: string, expireInSec: number): Promise<void> {
    await this.redis.multi().incr(key).expire(key, expireInSec).exec();
  }

  async decr(key: string): Promise<void> {
    await this.redis.multi().decr(key).exec();
  }

  get instance() {
    return this.redis;
  }
}
