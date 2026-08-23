import { Injectable } from '@nestjs/common';
import { CreateFarmCropDto } from './dto/create-farm_crop.dto';
import { UpdateFarmCropDto } from './dto/update-farm_crop.dto';

@Injectable()
export class FarmCropsService {
  create(createFarmCropDto: CreateFarmCropDto) {
    return 'This action adds a new farmCrop';
  }

  findAll() {
    return `This action returns all farmCrops`;
  }

  findOne(id: number) {
    return `This action returns a #${id} farmCrop`;
  }

  update(id: number, updateFarmCropDto: UpdateFarmCropDto) {
    return `This action updates a #${id} farmCrop`;
  }

  remove(id: number) {
    return `This action removes a #${id} farmCrop`;
  }
}
