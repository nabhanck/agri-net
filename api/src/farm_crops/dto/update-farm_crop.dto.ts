import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmCropDto } from './create-farm_crop.dto';

export class UpdateFarmCropDto extends PartialType(CreateFarmCropDto) {}
