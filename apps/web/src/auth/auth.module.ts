import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { RefreshTokenValidator } from './validators/refresh-token.validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRefreshTokenModule } from '@web/user-refresh-token/user-refresh-token.module';
import { TicketProviderExistsValidator } from './validators/ticket-provider-exists.validator';
import { TicketProviderModule } from '@web/ticket-provider/ticket-provider.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCode } from './auth-code.entity';
import { UserModule } from '@web/user/user.module';
import { MessageModule } from '@web/message/message.module';
import { UserExistsByPhoneNumberValidator } from './validators/user-exists-by-phone-number.validator';
import { AuthCodeRepository } from './auth-code.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthCode]),
    UserRefreshTokenModule,
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
    TicketProviderModule,
    UserModule,
    MessageModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenValidator,
    TicketProviderExistsValidator,
    UserExistsByPhoneNumberValidator,
    AuthCodeRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
