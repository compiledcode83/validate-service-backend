import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redeem } from '@app/redeem/redeem.entity';
import { RedeemController } from './redeem.controller';
import { RedeemService } from './redeem.service';
import { RedeemRepository } from './redeem.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Redeem])],
  controllers: [RedeemController],
  providers: [RedeemService, RedeemRepository],
  exports: [RedeemService],
})
export class RedeemModule {}
