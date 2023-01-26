import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (user) {
      return user;
    }

    throw new UnauthorizedException();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
