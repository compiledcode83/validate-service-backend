import { registerAs } from '@nestjs/config';
import path = require('path');

export default registerAs('databaseConfig', () => ({
  type: 'mysql',
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT || 3306,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [path.join(__dirname, '../../../../apps/**/*.entity{.ts,.js}')],
  subscribers: [path.join(__dirname, '../../../../apps/**/*.subscriber{.ts,.js}')],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  migrationsTableName: 'migrations',
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js')],
  charset: 'utf8mb4_unicode_ci',
  cli: {
    entitiesDir: 'src/**/',
    migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
  },
  legacySpatialSupport: false,
  extra: {
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || 200,
    waitForConnections: process.env.MYSQL_WAIT_FOR_CONNECTIONS === 'true',
  },
  poolSize: process.env.TYPEORM_POOL_SIZE,
  ssl: false,
}));
