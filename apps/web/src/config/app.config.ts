import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  environment: process.env.NODE_ENV,
  publicKey: process.env.APP_PUBLIC_KEY,
  privateKey: process.env.APP_PRIVATE_KEY,
  ticketDomain: process.env.APP_TICKET_DOMAIN,
  marketplaceDomain: process.env.APP_MARKETPLACE_DOMAIN,
}));
