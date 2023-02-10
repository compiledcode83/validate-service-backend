import { Injectable } from '@nestjs/common';
import { TicketProviderRepository } from './ticket-provider.repository';
import { CreateTicketProviderValidationDto } from './dto/create-ticket-provider.validation.dto';
import { UpdateTicketProviderValidationDto } from './dto/update-ticket-provider.validation.dto';
import { TicketProviderFilterDto } from './dto/ticket-provider.filter.dto';
import { PagingResult } from 'typeorm-cursor-pagination';
import { TicketProviderEncryptionKeyService } from '@admin/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketProviderService as CommonTicketProviderService } from '@app/ticket-provider/ticket-provider.service';

@Injectable()
export class TicketProviderService extends CommonTicketProviderService {
  constructor(
    private readonly ticketProviderRepository: TicketProviderRepository,
    private readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
  ) {
    super(ticketProviderRepository);
  }

  async create(createTicketProviderDto: CreateTicketProviderValidationDto) {
    const ticketProvider = await this.ticketProviderRepository.save(createTicketProviderDto);
    await this.ticketProviderEncryptionKeyService.create({
      ticketProviderId: ticketProvider.id,
    });

    return this.ticketProviderRepository.findOne({ where: { id: ticketProvider.id } });
  }

  async update(id: number, updateTicketProviderDto: UpdateTicketProviderValidationDto) {
    await this.ticketProviderRepository.update({ id }, updateTicketProviderDto);

    return this.findById(id);
  }

  async findMany(): Promise<TicketProvider[]> {
    return this.ticketProviderRepository.find();
  }

  async findAllPaginated(searchParams: TicketProviderFilterDto): Promise<PagingResult<TicketProvider>> {
    return this.ticketProviderRepository.getPaginatedQueryBuilder(searchParams);
  }

  async findById(id: number): Promise<TicketProvider> {
    return this.ticketProviderRepository.findOne({ where: { id } });
  }

  async isTicketProviderExist(id: number): Promise<boolean> {
    const ticketProvider = await this.ticketProviderRepository.findOne({ where: { id } });

    return ticketProvider !== null;
  }
}
