import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TicketProviderApiTokenModule } from '@src/ticket-provider-api-token/ticket-provider-api-token.module';
import { TicketProviderModule } from '@src/ticket-provider/ticket-provider.module';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { TicketProviderRefreshTokenModule } from '@src/ticket-provider-refresh-token/ticket-provider-refresh-token.module';
import { RefreshTokenValidator } from './validators/refresh-token.validator';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TicketProviderApiTokenModule,
    TicketProviderModule,
    TicketProviderRefreshTokenModule,
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
  providers: [AuthService, ApiKeyStrategy, JwtStrategy, LocalStrategy, RefreshTokenValidator],
  controllers: [AuthController],
})
export class AuthModule {}
