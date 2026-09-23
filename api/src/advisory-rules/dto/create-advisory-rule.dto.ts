import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsObject,
  IsBoolean,
  Length,
  Min,
  ValidateIf,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class ConditionDto {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsString()
  @IsNotEmpty()
  operator!: string;

//   @ValidateIf((_, value) => typeof value === 'number')
//   @IsNumber()
//   @ValidateIf((_, value) => typeof value === 'string')
//   @IsString()
  value!: number | string | boolean | Array<string | number>;
}

export class ConfigurationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions!: ConditionDto[];

  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class CreateAdvisoryRuleDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @IsInt()
  @IsNotEmpty()
  crop_id!: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  stage!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  risk_level!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  risk_type!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  rule_code!: string;

  @IsString() 
  @Length(1, 100)
  category!: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfigurationDto)
  configuration?: ConfigurationDto;

  @IsInt()
  @IsOptional()
  @Min(0)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  evidence?: string;
}

