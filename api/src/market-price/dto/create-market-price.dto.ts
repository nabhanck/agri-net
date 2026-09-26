import { IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class CreateMarketPriceDto {
  @IsInt()
  @IsOptional()
  farm_id?: number;

  @IsInt()
  @IsOptional()
  crop_id?: number;

  @IsInt()
  @IsOptional()
  farm_crop_id?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  state?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  district?: string;

  @IsString()
  @IsOptional()
  @Length(1, 150)
  market?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  commodity!: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  variety?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  grade?: string;

  @IsString()
  @IsOptional()
  arrival_date?: string;

  @IsNumber()
  @IsOptional()
  min_price?: number;

  @IsNumber()
  @IsOptional()
  max_price?: number;

  @IsNumber()
  @IsOptional()
  modal_price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsObject()
  @IsOptional()
  raw_data?: Record<string, any>;
}
