import { Module } from '@nestjs/common';
import { FarmCropsService } from './farm_crops.service';
import { FarmCropsController } from './farm_crops.controller';

@Module({
  controllers: [FarmCropsController],
  providers: [FarmCropsService],
})
export class FarmCropsModule {}
