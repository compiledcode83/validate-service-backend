import { plainToInstance } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateIf, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment, { groups: ['api'] })
  NODE_ENV: Environment;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_HOST: string;

  @IsInt({ groups: ['database'] })
  @Min(1, { groups: ['database'] })
  TYPEORM_PORT: number;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_PASSWORD: string;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_DATABASE: string;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_USERNAME: string;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_CONNECTION: string;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_MIGRATIONS: string;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_MIGRATIONS_DIR: string;

  @IsString({ groups: ['database'] })
  @MinLength(1, { groups: ['database'] })
  TYPEORM_LOGGING: string;

  @IsInt({ groups: ['database'] })
  @Min(10, { groups: ['database'] })
  TYPEORM_POOL_SIZE: number;

  @IsIn(['true', 'false'], { groups: ['database'] })
  MYSQL_TLS: 'true' | 'false';

  @IsString()
  @MinLength(1)
  KAFKA_BROKER_URL: string;

  @IsString()
  @MinLength(1)
  KAFKA_CONSUMER_GROUP: string;

  @IsIn(['true', 'false'])
  KAFKA_SSL: 'true' | 'false';

  @ValidateIf((o) => o.NODE_ENV === Environment.Production)
  @IsString()
  @MinLength(1)
  KAFKA_USERNAME: string;

  @ValidateIf((o) => o.NODE_ENV === Environment.Production)
  @IsString()
  @MinLength(1)
  KAFKA_PASSWORD: string;

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

  @IsString()
  @MinLength(1)
  REDIS_HOST: string;

  @IsString()
  @MinLength(1)
  REDIS_PORT: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string;

  @IsIn(['true', 'false'])
  REDIS_TLS: 'true' | 'false';
}

export function validateApi(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false, groups: ['api'] });

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
