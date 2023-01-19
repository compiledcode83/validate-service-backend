import { Module } from '@nestjs/common';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { SENTRY_CLIENT_TOKEN } from './sentry.constants';

@Module({
  providers: [
    {
      provide: SENTRY_CLIENT_TOKEN,
      useFactory: () => {
        if (process.env.NODE_ENV === 'production') {
          Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV,
            ignoreErrors: ['Non-Error exception captured'],
            integrations: [
              new RewriteFrames({
                root: global.__rootdir__,
              }),
            ],
          });
        }
      },
    },
  ],
})
export class SentryModule {}
