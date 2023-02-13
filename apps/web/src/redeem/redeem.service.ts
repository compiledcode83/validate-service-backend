import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DateTime } from 'luxon';
import { TicketService } from '@web/ticket/ticket.service';
import { CreateRedeemDto } from './dto/create-redeem.dto';
import { RedeemRepository } from './redeem.repository';
import { VerifyRedeemDto } from './dto/verify-redeem.dto';
import { QrService } from './qr.service';
import { MessageService } from '@web/message/message.service';
import { ConfigService } from '@nestjs/config';
import { TicketRedeemDto } from './dto/ticket-redeem.dto';
import { ShowRedeemQrResponseDto } from './dto/show-redeem-qr-response.dto';
import { RedeemTicket } from '../../../../libs/redeem/src/redeem-ticket.entity';
import { Redeem } from '@app/redeem/redeem.entity';
import { RedeemMode, RedeemStatus } from '@app/redeem/redeem.types';
import { Locale } from '@app/translation/translation.types';

@Injectable()
export class RedeemService {
  constructor(
    private readonly redeemRepository: RedeemRepository,
    private readonly ticketService: TicketService,
    private readonly qrService: QrService,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
  ) {}

  async create(params: CreateRedeemDto, req: Request): Promise<Redeem> {
    const queryRunner = this.redeemRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const tickets = await this.ticketService.findAllByPurchaseId(params.purchaseId);

      await queryRunner.manager
        .createQueryBuilder(Redeem, 'redeem')
        .setLock('pessimistic_write')
        .where({ purchaseId: params.purchaseId })
        .getOne();

      const redeem = await queryRunner.manager.save(
        this.redeemRepository.create({
          purchaseId: params.purchaseId,
          userId: tickets.at(0).userId,
          expireAt: DateTime.now()
            .plus({ minutes: this.configService.get('redeemConfig.redeemCodeExpireMinutes') })
            .toJSDate(),
          ip: req.ip,
          userAgent: req.headers?.['user-agent'] || null,
          status: RedeemStatus.NotRedeemed,
          mode: params.mode,
        }),
      );

      for (const ticket of tickets) {
        await queryRunner.manager.insert(RedeemTicket, {
          ticketId: ticket.id,
          redeemId: redeem.id,
        });
      }

      const savedRedeem = await queryRunner.manager.findOne(Redeem, {
        where: { uuid: redeem.uuid },
        relations: ['user'],
      });

      await this.messageService.createRedeemCodes(queryRunner, savedRedeem);
      await queryRunner.commitTransaction();

      return this.findByUuid(redeem.uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async verify(params: VerifyRedeemDto): Promise<any> {
    await this.redeemRepository.useRedeem(params.redeemUuid);
    await this.qrService.generateDisplayToken(params.redeemUuid);

    return this.findByUuid(params.redeemUuid);
  }

  async findByUuid(uuid: string, relations?: string[]): Promise<Redeem> {
    return this.redeemRepository.findByUuid(uuid, relations);
  }

  async findForVerify(uuid: string, code: number): Promise<Redeem> {
    return this.redeemRepository.findForVerify(uuid, code);
  }

  async findForRedeem(uuid: string): Promise<Redeem> {
    return this.redeemRepository.findForRedeem(uuid);
  }

  async getRedeemQrCodes(redeemUuid: string, locale: Locale): Promise<ShowRedeemQrResponseDto[]> {
    const redeem = await this.findForRedeem(redeemUuid);
    const qrCodes: ShowRedeemQrResponseDto[] = [];

    switch (redeem.mode) {
      case RedeemMode.Individual:
        for (const ticket of redeem.tickets) {
          const qrCode = await this.qrService.generateQrForTicket(redeem.uuid, ticket.uuid);
          qrCodes.push({
            ...qrCode,
            tickets: [new TicketRedeemDto(ticket, locale)],
          });
        }
        break;
      case RedeemMode.All:
        const [ticket] = redeem.tickets;
        const qrCode = await this.qrService.generateQrForPurchase(redeem.uuid, ticket.purchaseId);
        qrCodes.push({
          ...qrCode,
          tickets: redeem.tickets.map((ticket) => new TicketRedeemDto(ticket, locale)),
        });
    }

    return qrCodes;
  }

  async countRedeemsInLastHour(purchaseId: string): Promise<number> {
    return this.redeemRepository.countRedeemsInLastHour(purchaseId);
  }

  async getActivePurchaseRedeem(purchaseId: string, mode?: RedeemMode): Promise<Redeem> {
    return this.redeemRepository.getActivePurchaseRedeem(purchaseId, mode);
  }
}
