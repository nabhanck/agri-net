export type Language = 'en' | 'hi' | 'ml' | 'ta' | 'te' | 'kn' | 'mr';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  preferredLanguage: Language;
}

export interface FarmLocation {
  name: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type FarmSizeUnit = 'hectares' | 'acres' | 'cents' | 'bighas';

export interface CropInfo {
  id: string;
  name: string;
  localName?: string;
  category: 'cereal' | 'vegetable' | 'cash_crop' | 'plantation' | 'pulse';
  icon: string;
  popularVarieties: string[];
  growthStages: {
    stage: string;
    durationDays: number;
    description: string;
  }[];
  waterRequirement: 'Low' | 'Medium' | 'High' | 'Very High';
  optimalPhRange: [number, number];
  idealSoil: string[];
}

export interface SelectedCrop {
  cropId: string;
  cropName: string;
  variety: string;
  customVariety?: string;
  plantingDate: string;
  growthStage: string;
  growthStageProgress: number; // 0 to 100
  daysSincePlanting: number;
  expectedHarvestDate?: string;
}

export type SoilType = 
  | 'Clayey'
  | 'Loamy'
  | 'Sandy'
  | 'Alluvial'
  | 'Red Soil'
  | 'Black / Regur'
  | 'Laterite'
  | 'Other';

export interface SoilData {
  soilType: SoilType;
  ph: number;
  hasSoilTestResults: boolean | null;
  nitrogen?: 'Low' | 'Medium' | 'Optimal' | 'High';
  phosphorus?: 'Low' | 'Medium' | 'Optimal' | 'High';
  potassium?: 'Low' | 'Medium' | 'Optimal' | 'High';
  organicCarbon?: number;
}

export type IrrigationType = 
  | 'Rainfed'
  | 'Canal'
  | 'Borewell'
  | 'Drip'
  | 'Sprinkler'
  | 'Other';

export type FarmingPractice = 
  | 'Conventional'
  | 'Organic'
  | 'Regenerative'
  | 'Mixed / Integrated'
  | 'Not sure';

export interface FarmProfile {
  farmName: string;
  location: FarmLocation;
  size: number;
  sizeUnit: FarmSizeUnit;
  crop: SelectedCrop;
  soil: SoilData;
  irrigation: IrrigationType;
  practice: FarmingPractice;
  createdAt: string;
  isReady: boolean;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeedKmH: number;
  rainProbability: number;
  forecastSummary: string;
  hourly: { time: string; temp: number; icon: string; pop: number }[];
  daily: { day: string; high: number; low: number; condition: string; icon: string; rainChance: number }[];
}

export interface SatelliteNDVIData {
  overallHealthScore: number; // 0-100
  vegetationIndex: number; // e.g. 0.74 NDVI
  canopyDensity: string;
  waterStressLevel: 'Low' | 'Moderate' | 'High';
  satelliteLastPass: string;
  ndviTrend: '+4.2% vs last week' | '-1.5% vs last week';
  heatmapZones: { id: string; name: string; health: 'Optimal' | 'Attention' | 'Stress'; ndvi: number }[];
}

export interface FarmAdvisory {
  id: string;
  category: 'weather' | 'crop_stage' | 'soil_nutrition' | 'pest_radar' | 'irrigation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableStep: string;
  timeframe: string;
  icon: string;
}
