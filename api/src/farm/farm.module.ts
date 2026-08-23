import { Module } from '@nestjs/common';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { User } from 'src/user/entities/user.entity';
import { WeatherModule } from 'src/weather/weather.module';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { RuleEngineModule } from 'src/rule-engine/rule-engine.module';
import { GeminiService } from 'src/AI/gemini.service';
import { FarmCropAdvisory } from './entities/farm_crop_advisory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm, User, Crop, FarmCrop, FarmCropAdvisory]),
    WeatherModule,
    RuleEngineModule,
  ],
  controllers: [FarmController],
  providers: [FarmService, GeminiService],
})
export class FarmModule {}
