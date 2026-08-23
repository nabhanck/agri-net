export interface FarmObservation {
  cropId: number;
  growthStage: string;

  temperature?: number;
  humidity?: number;
  soilPh?: number;
  soilMoisturePercent?: number;

  rainfall24h?: number;
  rainfallForecast24h?: number;
  waterLevelCm?: number;
}