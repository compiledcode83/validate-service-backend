import { Module } from '@nestjs/common';
import { RedeemRepository } from './redeem.repository';

@Module({
  providers: [RedeemRepository],
})
export class RedeemModule {}
