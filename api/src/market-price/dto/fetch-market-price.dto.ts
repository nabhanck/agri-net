import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class FetchMarketPriceDto {
  @IsString()
  @IsNotEmpty()
  commodity!: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  market?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  farm_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  crop_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  farm_crop_id?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  limit?: number = 100;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  force_refresh?: boolean = false;
}
