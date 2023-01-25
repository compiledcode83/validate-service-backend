import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AdminModule } from '@admin/admin/admin.module';
import { AdminRefreshTokenModule } from '@admin/admin-refresh-token/admin-refresh-token.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { RefreshTokenValidator } from './validators/refresh-token.validator';
@Module({
  imports: [
    AdminModule,
    AdminRefreshTokenModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwtConfig.secret'),
          signOptions: { expiresIn: `${configService.get<string>('jwtConfig.accessTokenDurationMinutes')}m` },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenValidator],
  controllers: [AuthController],
})
export class AuthModule {}
