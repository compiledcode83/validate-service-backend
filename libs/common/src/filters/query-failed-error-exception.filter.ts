import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import * as Sentry from '@sentry/node';

@Catch(QueryFailedError)
export class QueryFailedErrorExceptionsFilter implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost): Promise<void> {
    const statusCode = 500;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

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

    response.status(statusCode).json({
      statusCode: statusCode,
      message: 'Internal server error',
    });
  }
}
