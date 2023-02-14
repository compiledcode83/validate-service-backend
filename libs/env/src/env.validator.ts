import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment, { groups: ['api', 'producer', 'consumer', 'web', 'admin'] })
  NODE_ENV: Environment;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_HOST: string;

  @IsInt({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @Min(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_PORT: number;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_PASSWORD: string;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_DATABASE: string;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_USERNAME: string;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_CONNECTION: string;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_MIGRATIONS: string;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_MIGRATIONS_DIR: string;

  @IsString({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @MinLength(1, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_LOGGING: string;

  @IsInt({ groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  @Min(10, { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  TYPEORM_POOL_SIZE: number;

  @IsIn(['true', 'false'], { groups: ['database', 'producer', 'consumer', 'web', 'admin'] })
  MYSQL_TLS: 'true' | 'false';

  @IsString({ groups: ['producer', 'consumer'] })
  @MinLength(1, { groups: ['producer', 'consumer'] })
  KAFKA_BROKER_URL: string;

  @IsString({ groups: ['producer', 'consumer'] })
  @MinLength(1, { groups: ['producer', 'consumer'] })
  KAFKA_CONSUMER_GROUP: string;

  @IsIn(['true', 'false'], { groups: ['producer', 'consumer'] })
  KAFKA_SSL: 'true' | 'false';

  @ValidateIf((o) => o.NODE_ENV === Environment.Production, { groups: ['producer', 'consumer'] })
  @IsString({ groups: ['producer'] })
  @MinLength(1, { groups: ['producer'] })
  KAFKA_USERNAME: string;

  @ValidateIf((o) => o.NODE_ENV === Environment.Production, { groups: ['producer', 'consumer'] })
  @IsString({ groups: ['producer', 'consumer'] })
  @MinLength(1, { groups: ['producer', 'consumer'] })
  KAFKA_PASSWORD: string;

  @IsInt({ groups: ['web'] })
  @Min(1, { groups: ['web'] })
  REDEEM_CODE_EXPIRE_MINUTES: number;

  @IsInt({ groups: ['web'] })
  @Min(1, { groups: ['web'] })
  REDEEM_LIMIT_PER_HOUR: number;

  @IsInt({ groups: ['web'] })
  @Min(100000, { groups: ['web'] })
  REDEEM_VERIFY_CODE_MIN: number;

  @IsInt({ groups: ['web'] })
  @Min(100000, { groups: ['web'] })
  REDEEM_VERIFY_CODE_MAX: number;

  @IsInt({ groups: ['web'] })
  @Min(1, { groups: ['web'] })
  REDEEM_QR_DISPLAY_TTL: number;

  @IsInt({ groups: ['web'] })
  @Min(1, { groups: ['web'] })
  REDEEM_QR_HASH_TTL: number;

  @IsInt({ groups: ['web'] })
  @Min(16, { groups: ['web'] })
  REDEEM_QR_HASH_LENGTH: number;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  APP_PUBLIC_KEY: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  APP_PRIVATE_KEY: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  APP_TICKET_DOMAIN: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  APP_MARKETPLACE_DOMAIN: string;

  @IsInt({ groups: ['web'] })
  @Min(100000, { groups: ['web'] })
  APP_AUTH_CODE_MIN: number;

  @IsInt({ groups: ['web'] })
  @Min(100000, { groups: ['web'] })
  APP_AUTH_CODE_MAX: number;

  @IsInt({ groups: ['web'] })
  @Min(1, { groups: ['web'] })
  @Max(30, { groups: ['web'] })
  APP_AUTH_CODE_TTL_MINUTES: number;

  @IsIn(['true', 'false'], { groups: ['web'] })
  APP_AUTH_CODE_FAKE_GENERATOR: string;

  @IsString({ groups: ['api'] })
  @MinLength(64, { groups: ['api'] })
  API_JWT_SECRET: string;

  @IsString({ groups: ['api'] })
  @MinLength(1, { groups: ['api'] })
  API_JWT_REFRESH_TOKEN_COOKIE_DOMAIN: string;

  @IsString({ groups: ['api'] })
  @MinLength(1, { groups: ['api'] })
  API_JWT_REFRESH_TOKEN_DURATION_DAYS: string;

  @IsString({ groups: ['api'] })
  @MinLength(1, { groups: ['api'] })
  API_JWT_REFRESH_TOKEN_MAX_SESSIONS: string;

  @IsString({ groups: ['api'] })
  @MinLength(1, { groups: ['api'] })
  API_JWT_ACCESS_TOKEN_DURATION_MINUTES: string;

  @IsString({ groups: ['api'] })
  @IsIn(['true', 'false'], { groups: ['api'] })
  API_JWT_REFRESH_TOKEN_COOKIE_SECURE: 'true' | 'false';

  @IsString({ groups: ['api'] })
  @IsIn(['true', 'false'], { groups: ['api'] })
  API_JWT_REFRESH_TOKEN_COOKIE_HTTPONLY: 'true' | 'false';

  @IsString({ groups: ['api'] })
  @MinLength(1, { groups: ['api'] })
  REDIS_HOST: string;

  @IsString({ groups: ['api'] })
  @MinLength(1, { groups: ['api'] })
  REDIS_PORT: string;

  @IsString({ groups: ['api'] })
  @IsOptional({ groups: ['api'] })
  REDIS_PASSWORD: string;

  @IsIn(['true', 'false'], { groups: ['api'] })
  REDIS_TLS: 'true' | 'false';

  @IsString({ groups: ['api', 'web', 'producer', 'consumer'] })
  SENTRY_DSN: string;

  @IsString({ groups: ['web'] })
  @MinLength(64, { groups: ['web'] })
  WEB_JWT_SECRET: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  WEB_JWT_REFRESH_TOKEN_COOKIE_DOMAIN: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  WEB_JWT_REFRESH_TOKEN_DURATION_DAYS: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  WEB_JWT_REFRESH_TOKEN_MAX_SESSIONS: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  WEB_JWT_ACCESS_TOKEN_DURATION_MINUTES: string;

  @IsString({ groups: ['web'] })
  @IsIn(['true', 'false'], { groups: ['web'] })
  WEB_JWT_REFRESH_TOKEN_COOKIE_SECURE: 'true' | 'false';

  @IsString({ groups: ['web'] })
  @IsIn(['true', 'false'], { groups: ['web'] })
  WEB_JWT_REFRESH_TOKEN_COOKIE_HTTPONLY: 'true' | 'false';

  @IsInt({ groups: ['web'] })
  @Min(1, { groups: ['web'] })
  ORDER_PRIMARY_RESERVATION_MINUTES: number;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  STRIPE_API_KEY: string;

  @IsString({ groups: ['web'] })
  @MinLength(1, { groups: ['web'] })
  STRIPE_WEBHOOK_SECRET: string;

  @IsString({ groups: ['admin'] })
  @MinLength(64, { groups: ['admin'] })
  ADMIN_JWT_SECRET: string;

  @IsString({ groups: ['admin'] })
  @MinLength(1, { groups: ['admin'] })
  ADMIN_JWT_REFRESH_TOKEN_COOKIE_DOMAIN: string;

  @IsString({ groups: ['admin'] })
  @MinLength(1, { groups: ['admin'] })
  ADMIN_JWT_REFRESH_TOKEN_DURATION_DAYS: string;

  @IsString({ groups: ['admin'] })
  @MinLength(1, { groups: ['admin'] })
  ADMIN_JWT_REFRESH_TOKEN_MAX_SESSIONS: string;

  @IsString({ groups: ['admin'] })
  @MinLength(1, { groups: ['admin'] })
  ADMIN_JWT_ACCESS_TOKEN_DURATION_MINUTES: string;

  @IsString({ groups: ['admin'] })
  @IsIn(['true', 'false'], { groups: ['admin'] })
  ADMIN_JWT_REFRESH_TOKEN_COOKIE_SECURE: 'true' | 'false';

  @IsString({ groups: ['admin'] })
  @IsIn(['true', 'false'], { groups: ['admin'] })
  ADMIN_JWT_REFRESH_TOKEN_COOKIE_HTTPONLY: 'true' | 'false';
}

export function validateApi(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['api'] });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export function validateWeb(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['web'] });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export function validateAdmin(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['admin'] });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export function validateDatabaseConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['database'] });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export function validateProducer(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['producer'] });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export function validateConsumer(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['consumer'] });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
