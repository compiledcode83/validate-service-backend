import { plainToInstance } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsString, Min, MinLength, ValidateIf, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  @MinLength(1)
  TYPEORM_HOST: string;

  @IsInt()
  @Min(1)
  TYPEORM_PORT: number;

  @IsString()
  @MinLength(1)
  TYPEORM_PASSWORD: string;

  @IsString()
  @MinLength(1)
  TYPEORM_DATABASE: string;

  @IsString()
  @MinLength(1)
  TYPEORM_USERNAME: string;

  @IsString()
  @MinLength(1)
  TYPEORM_CONNECTION: string;

  @IsString()
  @MinLength(1)
  TYPEORM_MIGRATIONS: string;

  @IsString()
  @MinLength(1)
  TYPEORM_MIGRATIONS_DIR: string;

  @IsString()
  @MinLength(1)
  TYPEORM_LOGGING: string;

  @IsInt()
  @Min(10)
  TYPEORM_POOL_SIZE: number;

  @IsIn(['true', 'false'])
  MYSQL_TLS: string;

  @IsString()
  @MinLength(1)
  KAFKA_CONSUMER_BROKER_URL: string;

  @IsString()
  @MinLength(1)
  KAFKA_CONSUMER_CONSUMER_GROUP: string;

  @IsIn(['true', 'false'])
  KAFKA_CONSUMER_SSL: string;

  @ValidateIf((o) => o.NODE_ENV === Environment.Production)
  @IsString()
  @MinLength(1)
  KAFKA_CONSUMER_USERNAME: string;

  @ValidateIf((o) => o.NODE_ENV === Environment.Production)
  @IsString()
  @MinLength(1)
  KAFKA_CONSUMER_PASSWORD: string;

  @IsString()
  @MinLength(1)
  KAFKA_PRODUCER_BROKER_URL: string;

  @IsString()
  @MinLength(1)
  KAFKA_PRODUCER_CONSUMER_GROUP: string;

  @IsIn(['true', 'false'])
  KAFKA_PRODUCER_SSL: string;

  @ValidateIf((o) => o.NODE_ENV === Environment.Production)
  @IsString()
  @MinLength(1)
  KAFKA_PRODUCER_USERNAME: string;

  @ValidateIf((o) => o.NODE_ENV === Environment.Production)
  @IsString()
  @MinLength(1)
  KAFKA_PRODUCER_PASSWORD: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
