import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsInt,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFarmCropItemDto {
  @IsInt()
  @IsNotEmpty()
  crop_id!: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  variety?: string;

  @IsOptional()
  planting_date?: Date | string;

  @IsInt()
  @IsOptional()
  growth_stage_id?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;
}

export class CreateFarmDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number; // Links the farm to the owner/creator

  @IsArray()
  @IsInt({ each: true }) // Validates that every item in the array is an integer
  @IsOptional()
  crop_Ids?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFarmCropItemDto)
  @IsOptional()
  crops?: CreateFarmCropItemDto[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90.0, { message: 'Latitude must be between -90 and 90 degrees' })
  @Max(90.0, { message: 'Latitude must be between -90 and 90 degrees' })
  @Type(() => Number) // Converts string inputs to numeric value automatically
  latitude!: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180.0, { message: 'Longitude must be between -180 and 180 degrees' })
  @Max(180.0, { message: 'Longitude must be between -180 and 180 degrees' })
  @Type(() => Number)
  longitude!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Area must be greater than zero' })
  @IsOptional()
  @Type(() => Number)
  area?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  soil_type?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'soilPh must be a number with up to 2 decimal places' })
  @Min(0.00, { message: 'soilPh cannot be less than 0.00' })
  @Max(14.00, { message: 'soilPh cannot be greater than 14.00 (maximum alkaline level)' })
  @Type(() => Number) // Ensures incoming payload strings are coerced into JavaScript numbers
  soilPh?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  irrigation_type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  farming_practice?: string;
}