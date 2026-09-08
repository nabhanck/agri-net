import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { GrowthStage } from 'src/crops-growth-stages/entities/growth-stage.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import {
  EvaluationSummary,
  FarmCropEvaluationResult,
  StageTransitionInfo,
} from './interfaces/crop-growth.interface';
import {
  CROP_GROWTH_STAGE_CHANGED_EVENT,
  CropGrowthStageChangedEvent,
} from './events/crop-growth-stage-changed.event';

/**
 * Calculates calendar days elapsed between planting date and reference date.
 */
export function calculateDaysElapsed(
  plantingDate: Date | string,
  referenceDate: Date = new Date(),
): number {
  if (!plantingDate) return NaN;
  const p = new Date(plantingDate);
  const ref = new Date(referenceDate);
  if (isNaN(p.getTime()) || isNaN(ref.getTime())) return NaN;

  const utcPlanting = Date.UTC(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate());
  const utcRef = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utcRef - utcPlanting) / msPerDay);
}

@Injectable()
export class CropGrowthService {
  private readonly logger = new Logger(CropGrowthService.name);

  constructor(
    @InjectRepository(FarmCrop)
    private readonly farmCropRepository: Repository<FarmCrop>,

    @InjectRepository(GrowthStage)
    private readonly growthStageRepository: Repository<GrowthStage>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  /**
   * Pure calculation: determines the expected growth stage for a crop based on elapsed days.
   *
   * Example:
   * Germination: 10d (0-10)
   * Tillering: 25d (11-35)
   * Panicle Initiation: 20d (36-55)
   * Flowering: 20d (56-75)
   * Grain Filling: 25d (76-100)
   * Maturity: 20d (101-120+)
   *
   * @param stages Configured growth stages for the crop
   * @param daysElapsed Days elapsed since planting
   * @returns The expected GrowthStage or null if no stages defined
   */
  calculateExpectedStage(stages: GrowthStage[], daysElapsed: number): GrowthStage | null {
    if (!stages || stages.length === 0) {
      return null;
    }

    // Sort stages in ascending stage_order
    const sortedStages = [...stages].sort((a, b) => a.stage_order - b.stage_order);

    // If planting date is in the future or day 0, return the first stage
    if (daysElapsed <= 0) {
      return sortedStages[0];
    }

    let cumulativeDays = 0;
    for (const stage of sortedStages) {
      const duration = Math.max(0, Number(stage.duration_days) || 0);
      cumulativeDays += duration;
      if (daysElapsed <= cumulativeDays) {
        return stage;
      }
    }

    // If elapsed days exceed total duration, stay at the final stage (e.g. Maturity)
    return sortedStages[sortedStages.length - 1];
  }

  /**
   * Evaluates all active FarmCrop records and updates their growth stages.
   * Optimized to batch-load growth stages in a single query to avoid N+1 issues.
   *
   * @param referenceDate Date against which to calculate elapsed days (defaults to today)
   */
  async evaluateAllActiveFarmCrops(referenceDate: Date = new Date()): Promise<EvaluationSummary> {
    this.logger.log('Crop growth scheduler started');

    // Fetch active farm crops with necessary relations
    const farmCrops = await this.farmCropRepository.find({
      where: { is_active: true },
      relations: {
        crop: true,
        growth_stage: true,
        farm: true,
      },
    });

    // Filter out any crops explicitly marked as inactive or harvested
    const activeCrops = farmCrops.filter(
      (fc) => fc.is_active !== false && fc.status?.toLowerCase() !== 'harvested' && fc.status?.toLowerCase() !== 'inactive',
    );

    this.logger.log(`Processing ${activeCrops.length} active farm crops`);

    // Fetch all growth stages across all crops in a single query
    const allGrowthStages = await this.growthStageRepository.find({
      order: { crop_id: 'ASC', stage_order: 'ASC' },
    });

    // Group growth stages by crop_id for O(1) lookup
    const stagesByCropId = new Map<number, GrowthStage[]>();
    for (const stage of allGrowthStages) {
      const existing = stagesByCropId.get(stage.crop_id) || [];
      existing.push(stage);
      stagesByCropId.set(stage.crop_id, existing);
    }

    const summary: EvaluationSummary = {
      totalActive: activeCrops.length,
      evaluated: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      errors: 0,
      results: [],
      errorDetails: [],
    };

    for (const farmCrop of activeCrops) {
      try {
        const cropStages = stagesByCropId.get(farmCrop.crop_id) || [];
        const result = await this.processFarmCrop(farmCrop, cropStages, referenceDate, true);

        summary.results.push(result);

        if (result.skipped) {
          summary.skipped++;
        } else {
          summary.evaluated++;
          if (result.changed) {
            summary.updated++;
          } else {
            summary.unchanged++;
          }
        }
      } catch (error) {
        summary.errors++;
        const errorMessage = (error as Error).message || String(error);
        this.logger.error(`Error processing FarmCrop #${farmCrop.id}: ${errorMessage}`, (error as Error).stack);
        summary.errorDetails?.push({
          farmCropId: farmCrop.id,
          error: errorMessage,
        });
      }
    }

    this.logger.log(
      `Crop growth scheduler completed. Total: ${summary.totalActive}, Evaluated: ${summary.evaluated}, Updated: ${summary.updated}, Unchanged: ${summary.unchanged}, Skipped: ${summary.skipped}, Errors: ${summary.errors}`,
    );

    return summary;
  }

  /**
   * Evaluates a single FarmCrop by ID.
   *
   * @param farmCropId FarmCrop ID
   * @param options Options to persist changes and specify referenceDate
   */
  async evaluateFarmCropById(
    farmCropId: number,
    options: { persist?: boolean; referenceDate?: Date } = {},
  ): Promise<FarmCropEvaluationResult> {
    const { persist = true, referenceDate = new Date() } = options;

    const farmCrop = await this.farmCropRepository.findOne({
      where: { id: farmCropId },
      relations: {
        crop: true,
        growth_stage: true,
        farm: true,
      },
    });

    if (!farmCrop) {
      throw new NotFoundException(`FarmCrop with ID ${farmCropId} not found`);
    }

    const cropStages = await this.growthStageRepository.find({
      where: { crop_id: farmCrop.crop_id },
      order: { stage_order: 'ASC' },
    });

    return await this.processFarmCrop(farmCrop, cropStages, referenceDate, persist);
  }

  /**
   * Internal processor for an individual FarmCrop record.
   */
  private async processFarmCrop(
    farmCrop: FarmCrop,
    stages: GrowthStage[],
    referenceDate: Date,
    persist: boolean,
  ): Promise<FarmCropEvaluationResult> {
    const cropName = farmCrop.crop?.name || `Crop #${farmCrop.crop_id}`;
    const previousStageInfo: StageTransitionInfo = {
      id: farmCrop.growth_stage_id || farmCrop.growth_stage?.id || null,
      name: farmCrop.growth_stage?.stage_name || null,
      order: farmCrop.growth_stage?.stage_order || undefined,
    };

    // Edge case: Inactive or harvested crop
    if (farmCrop.is_active === false || farmCrop.status?.toLowerCase() === 'harvested' || farmCrop.status?.toLowerCase() === 'inactive') {
      this.logger.debug(`FarmCrop #${farmCrop.id}: skipped - inactive or harvested status (${farmCrop.status})`);
      return {
        farmCropId: farmCrop.id,
        farmId: farmCrop.farm_id,
        cropId: farmCrop.crop_id,
        cropName,
        plantingDate: farmCrop.planting_date,
        daysSincePlanting: null,
        previousStage: previousStageInfo,
        newStage: null,
        changed: false,
        skipped: true,
        skipReason: `FarmCrop is inactive or harvested (status: ${farmCrop.status || 'inactive'})`,
      };
    }

    // Edge case: Missing planting_date
    if (!farmCrop.planting_date) {
      this.logger.warn(`FarmCrop #${farmCrop.id} (${cropName}): skipped - missing planting_date`);
      return {
        farmCropId: farmCrop.id,
        farmId: farmCrop.farm_id,
        cropId: farmCrop.crop_id,
        cropName,
        plantingDate: null,
        daysSincePlanting: null,
        previousStage: previousStageInfo,
        newStage: null,
        changed: false,
        skipped: true,
        skipReason: 'planting_date is missing',
      };
    }

    // Edge case: No growth stages configured
    if (!stages || stages.length === 0) {
      this.logger.warn(`FarmCrop #${farmCrop.id} (${cropName}): skipped - no growth stages configured for crop #${farmCrop.crop_id}`);
      return {
        farmCropId: farmCrop.id,
        farmId: farmCrop.farm_id,
        cropId: farmCrop.crop_id,
        cropName,
        plantingDate: farmCrop.planting_date,
        daysSincePlanting: null,
        previousStage: previousStageInfo,
        newStage: null,
        changed: false,
        skipped: true,
        skipReason: `No growth stages configured for crop #${farmCrop.crop_id}`,
      };
    }

    // Calculate days elapsed
    const daysElapsed = calculateDaysElapsed(farmCrop.planting_date, referenceDate);
    if (isNaN(daysElapsed)) {
      this.logger.warn(`FarmCrop #${farmCrop.id} (${cropName}): skipped - invalid planting_date (${farmCrop.planting_date})`);
      return {
        farmCropId: farmCrop.id,
        farmId: farmCrop.farm_id,
        cropId: farmCrop.crop_id,
        cropName,
        plantingDate: farmCrop.planting_date,
        daysSincePlanting: null,
        previousStage: previousStageInfo,
        newStage: null,
        changed: false,
        skipped: true,
        skipReason: 'Invalid planting_date format',
      };
    }

    // Determine expected stage
    const expectedStage = this.calculateExpectedStage(stages, daysElapsed);
    if (!expectedStage) {
      this.logger.warn(`FarmCrop #${farmCrop.id} (${cropName}): skipped - could not determine growth stage`);
      return {
        farmCropId: farmCrop.id,
        farmId: farmCrop.farm_id,
        cropId: farmCrop.crop_id,
        cropName,
        plantingDate: farmCrop.planting_date,
        daysSincePlanting: daysElapsed,
        previousStage: previousStageInfo,
        newStage: null,
        changed: false,
        skipped: true,
        skipReason: 'Could not calculate growth stage',
      };
    }

    const newStageInfo: StageTransitionInfo = {
      id: expectedStage.id,
      name: expectedStage.stage_name,
      order: expectedStage.stage_order,
    };

    const hasStageChanged = previousStageInfo.id !== expectedStage.id;

    if (!hasStageChanged) {
      this.logger.log(`FarmCrop #${farmCrop.id}: no stage change`);
      return {
        farmCropId: farmCrop.id,
        farmId: farmCrop.farm_id,
        cropId: farmCrop.crop_id,
        cropName,
        plantingDate: farmCrop.planting_date,
        daysSincePlanting: daysElapsed,
        previousStage: previousStageInfo,
        newStage: newStageInfo,
        changed: false,
        skipped: false,
      };
    }

    // Stage changed or initialized
    const prevDisplay = previousStageInfo.name || (previousStageInfo.id ? `Stage #${previousStageInfo.id}` : 'None');
    this.logger.log(`FarmCrop #${farmCrop.id}: ${prevDisplay} → ${expectedStage.stage_name}`);

    if (persist) {
      farmCrop.growth_stage_id = expectedStage.id;
      farmCrop.growth_stage = expectedStage;
      await this.farmCropRepository.save(farmCrop);

      // Create and emit transition event for advisory engine / external consumers
      const event = new CropGrowthStageChangedEvent(
        farmCrop.id,
        farmCrop.farm_id,
        farmCrop.crop_id,
        cropName,
        previousStageInfo,
        {
          id: expectedStage.id,
          name: expectedStage.stage_name,
          order: expectedStage.stage_order,
        },
        daysElapsed,
        new Date(),
      );

      this.publishStageTransition(event);
    }

    return {
      farmCropId: farmCrop.id,
      farmId: farmCrop.farm_id,
      cropId: farmCrop.crop_id,
      cropName,
      plantingDate: farmCrop.planting_date,
      daysSincePlanting: daysElapsed,
      previousStage: previousStageInfo,
      newStage: newStageInfo,
      changed: true,
      skipped: false,
    };
  }

  /**
   * Publishes stage transition event to EventEmitter2 and executes any transition hooks.
   */
  publishStageTransition(event: CropGrowthStageChangedEvent): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(CROP_GROWTH_STAGE_CHANGED_EVENT, event);
    }
  }
}
