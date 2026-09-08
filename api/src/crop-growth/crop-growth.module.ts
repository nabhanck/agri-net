import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropGrowthService } from './crop-growth.service';
import { CropGrowthSchedulerService } from './crop-growth-scheduler.service';
import { CropGrowthController } from './crop-growth.controller';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { GrowthStage } from 'src/crops-growth-stages/entities/growth-stage.entity';
import { Crop } from 'src/crops/entities/crop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmCrop, GrowthStage, Crop]),
  ],
  controllers: [CropGrowthController],
  providers: [CropGrowthService, CropGrowthSchedulerService],
  exports: [CropGrowthService, CropGrowthSchedulerService],
})
export class CropGrowthModule {}
