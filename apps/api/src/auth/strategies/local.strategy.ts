import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<any> {
    const ticketProvider = await this.authService.validateByPassword(email, password);

    if (!ticketProvider) {
      throw new UnauthorizedException('Incorrect username or password');
    }

    return ticketProvider;
  }
}
