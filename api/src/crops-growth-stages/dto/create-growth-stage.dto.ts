import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateGrowthStageDto {
  @IsInt()
  @IsNotEmpty()
  crop_id!: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  stage_name!: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  stage_order!: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  duration_days?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
