import { UniqueTokenStrategy } from 'passport-unique-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(UniqueTokenStrategy, 'Api-Key') {
  constructor(private authService: AuthService) {
    super({
      tokenHeader: 'Api-Key',
      failOnMissing: true,
    });
  }

  async validate(token: string): Promise<any> {
    const ticketProvider = await this.authService.validateTicketProvider(token);

    if (!ticketProvider) {
      throw new UnauthorizedException();
    }

    return ticketProvider;
  }
}
