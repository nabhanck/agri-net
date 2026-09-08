import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateFarmCropDto {
  @IsInt()
  @IsOptional()
  farm_id?: number;

  @IsInt()
  @IsNotEmpty()
  crop_id!: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  variety?: string;

  @IsDateString()
  @IsOptional()
  planting_date?: Date;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  status?: string;

  @IsInt()
  @IsOptional()
  growth_stage_id?: number;
}
