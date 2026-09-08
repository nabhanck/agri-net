import { StageTransitionInfo } from '../interfaces/crop-growth.interface';

export const CROP_GROWTH_STAGE_CHANGED_EVENT = 'crop.growth_stage.changed';

export class CropGrowthStageChangedEvent {
  constructor(
    public readonly farmCropId: number,
    public readonly farmId: number,
    public readonly cropId: number,
    public readonly cropName: string,
    public readonly previousStage: StageTransitionInfo,
    public readonly newStage: { id: number; name: string; order: number },
    public readonly daysSincePlanting: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
