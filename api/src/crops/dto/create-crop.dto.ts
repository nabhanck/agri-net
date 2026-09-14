import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, ValidateNested } from 'class-validator';
import { CreateAdvisoryRuleDto } from 'src/advisory-rules/dto/create-advisory-rule.dto';
import { CreateFarmCropDto } from 'src/farm_crops/dto/create-farm_crop.dto';

export class CreateCropDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens (e.g., ir64-rice)',
  })
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  varieties?: string[];

  @IsString()
  @IsOptional()
  @Length(1, 100)
  family?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  water_requirement?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  growing_season?: string;

  @IsInt()
  @IsOptional()
  maturity_days?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  scientific_name?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFarmCropDto)
  farm_crops?: CreateFarmCropDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAdvisoryRuleDto)
  advisory?: CreateAdvisoryRuleDto[];
}
