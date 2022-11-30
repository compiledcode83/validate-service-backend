import { ExceptionFilter, Catch, ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionsFilter implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost): Promise<void> {
    let statusCode;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    if (!exception?.getStatus()) {
      statusCode = exception?.getStatus() || exception.code;
    }

    Sentry.setContext('request', {
      url: request.url,
      body: request.body,
      query: request.query,
      params: request.params,
      language: request.language,
      headers: request.headers,
      rawHeaders: request.rawHeaders,
    });
    Sentry.captureException(exception);

    response.status(statusCode || 500).json({
      statusCode: statusCode || 500,
      message: 'Internal server error',
    });
  }
}
