import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestToBodyInterceptor implements NestInterceptor {
  public requestAttributeName: string;
  public bodyAttributeName: string;

  constructor(requestAttributeName: string, bodyAttributeName: string) {
    this.requestAttributeName = requestAttributeName;
    this.bodyAttributeName = bodyAttributeName;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (Object.prototype.hasOwnProperty.call(request, this.requestAttributeName)) {
      request.body[this.bodyAttributeName] = request[this.requestAttributeName];
    }

    return next.handle().pipe();
  }
}
