import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropsGrowthStagesService } from './crops-growth-stages.service';
import { CropsGrowthStagesController } from './crops-growth-stages.controller';
import { GrowthStage } from './entities/growth-stage.entity';
import { Crop } from 'src/crops/entities/crop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GrowthStage, Crop])],
  controllers: [CropsGrowthStagesController],
  providers: [CropsGrowthStagesService],
  exports: [CropsGrowthStagesService],
})
export class CropsGrowthStagesModule {}
