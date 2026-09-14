export type CreateFarmDto = {
  user_id: number;
  crop_Ids: number[];
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

export type Farm = CreateFarmDto;