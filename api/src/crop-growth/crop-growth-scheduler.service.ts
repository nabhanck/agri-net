import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CropGrowthService } from './crop-growth.service';
import { EvaluationSummary } from './interfaces/crop-growth.interface';

@Injectable()
export class CropGrowthSchedulerService {
  private readonly logger = new Logger(CropGrowthSchedulerService.name);

  constructor(private readonly cropGrowthService: CropGrowthService) {}

  /**
   * Daily scheduled cron job to evaluate crop growth stages.
   * Runs once every day at midnight (00:00).
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-crop-growth-stage-evaluation',
    timeZone: process.env.TZ || 'UTC',
  })
  async handleDailyGrowthStageEvaluation(): Promise<EvaluationSummary | null> {
    this.logger.log('Crop growth scheduler started');
    try {
      const summary = await this.cropGrowthService.evaluateAllActiveFarmCrops();
      this.logger.log(
        `Crop growth scheduler completed successfully. Evaluated: ${summary.evaluated}, Updated: ${summary.updated}, Skipped: ${summary.skipped}, Errors: ${summary.errors}`,
      );
      return summary;
    } catch (error) {
      this.logger.error(
        `Unexpected error in daily crop growth stage evaluation: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return null;
    }
  }
}
