import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenInterface } from '../auth.types';
import { AuthService } from '../auth.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwtConfig.secret'),
    });
  }

  async validate(payload: AccessTokenInterface) {
    const user = await this.authService.validateByAccessToken(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    return instanceToPlain(user, { ignoreDecorators: true });
  }
}
