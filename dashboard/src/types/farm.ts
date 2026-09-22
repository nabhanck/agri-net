export type CreateFarmCropDto = {
  crop_id: number;
  variety?: string;
  planting_date?: string | Date;
  growth_stage_id?: number;
  is_active?: boolean;
  status?: string;
};

export type CreateFarmDto = {
  user_id: number;
  crop_Ids?: number[];
  crops?: CreateFarmCropDto[];
  name: string;
  latitude: number;
  longitude: number;
  area?: number;
  soil_type?: string;
  soilPh?: number;
  irrigation_type?: string;
  farming_practice?: string;
};

export type UpdateFarmDto = Partial<CreateFarmDto>;

export type CropEntity = {
  id: number;
  slug: string;
  name: string;
  varieties?: string[];
  family?: string;
  water_requirement?: string;
  growing_season?: string;
  maturity_days?: number;
  scientific_name?: string;
  optimal_ph_range?: number[];
};

export type GrowthStageEntity = {
  id: number;
  crop_id?: number;
  stage_name?: string;
  stage_order?: number;
  description?: string;
  duration_days?: number;
};

export type FarmCropEntity = {
  id: number;
  farm_id: number;
  crop_id: number;
  crop?: CropEntity;
  variety?: string;
  planting_date?: string | Date;
  is_active: boolean;
  status: string;
  growth_stage_id?: number;
  growth_stage?: GrowthStageEntity;
};

export type FarmEntity = {
  id: number;
  user_id: number;
  name: string;
  latitude: number;
  longitude: number;
  area?: number;
  area_unit?: string;
  soil_type?: string;
  soilPh?: number;
  irrigation_type?: string;
  farming_practice?: string;
  crops?: FarmCropEntity[];
  created_at?: string | Date;
  updated_at?: string | Date;
};

export type Farm = FarmEntity;