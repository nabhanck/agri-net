import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MarketPriceService } from './market-price.service';
import { MarketPriceController } from './market-price.controller';
import { MarketPrice } from './entities/market-price.entity';
import { Farm } from 'src/farm/entities/farm.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketPrice, Farm, Crop, FarmCrop]),
    HttpModule,
  ],
  controllers: [MarketPriceController],
  providers: [MarketPriceService],
  exports: [MarketPriceService],
})
export class MarketPriceModule {}
