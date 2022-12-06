import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Sentry from '@sentry/node';
import { OutboxService } from '@src/outbox/outbox.service';
import { ProducerService } from '@src/producer/producer.service';

@Injectable()
export class ProducerTasks {
  private readonly logger = new Logger(ProducerTasks.name);

  constructor(private readonly producerService: ProducerService, private readonly outboxService: OutboxService) {}

  @Cron(CronExpression.EVERY_SECOND)
  async produceMessages() {
    try {
      const startTime = performance.now();
      const messages = await this.outboxService.findAll();

      if (messages.length > 0) {
        const batch = messages.map((message) => ({
          topic: message.eventName,
          messages: [
            {
              value: JSON.stringify(message.payload),
            },
          ],
        }));

        await this.producerService.sendBatch(batch);
        await this.outboxService.setAsSent(messages.map((message) => message.id));

        this.logger.log(`Produced ${messages.length} messages in ${Math.floor(performance.now() - startTime)}ms`);
      }
    } catch (err) {
      this.logger.error(`Error producing messages: ${err?.message}`);

      Sentry.captureException(err);

      process.exitCode = 1;
      process.exit(1);
    }
  }
}
