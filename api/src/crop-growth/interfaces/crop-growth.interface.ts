export interface StageTransitionInfo {
  id: number | null;
  name: string | null;
  order?: number;
}

export interface FarmCropEvaluationResult {
  farmCropId: number;
  farmId: number;
  cropId: number;
  cropName: string;
  plantingDate: string | Date | null;
  daysSincePlanting: number | null;
  previousStage: StageTransitionInfo;
  newStage: StageTransitionInfo | null;
  changed: boolean;
  skipped: boolean;
  skipReason?: string;
}

export interface EvaluationSummary {
  totalActive: number;
  evaluated: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: number;
  results: FarmCropEvaluationResult[];
  errorDetails?: Array<{ farmCropId: number; error: string }>;
}
