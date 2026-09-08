import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CropGrowthService } from './crop-growth.service';

@Controller('crop-growth')
export class CropGrowthController {
  constructor(private readonly cropGrowthService: CropGrowthService) {}

  /**
   * Manually trigger evaluation of all active farm crops.
   */
  @Post('evaluate')
  async evaluateAll(@Query('date') dateStr?: string) {
    const referenceDate = dateStr ? new Date(dateStr) : new Date();
    const summary = await this.cropGrowthService.evaluateAllActiveFarmCrops(referenceDate);
    return {
      message: 'Crop growth stage evaluation completed',
      data: summary,
    };
  }

  /**
   * Evaluate and persist growth stage for a specific FarmCrop.
   */
  @Post('evaluate/:farmCropId')
  async evaluateOne(
    @Param('farmCropId', ParseIntPipe) farmCropId: number,
    @Query('date') dateStr?: string,
  ) {
    const referenceDate = dateStr ? new Date(dateStr) : new Date();
    const result = await this.cropGrowthService.evaluateFarmCropById(farmCropId, {
      persist: true,
      referenceDate,
    });
    return {
      message: `Evaluation completed for FarmCrop #${farmCropId}`,
      data: result,
    };
  }

  /**
   * Preview calculated growth stage for a specific FarmCrop without persisting changes.
   */
  @Get('preview/:farmCropId')
  async previewOne(
    @Param('farmCropId', ParseIntPipe) farmCropId: number,
    @Query('date') dateStr?: string,
  ) {
    const referenceDate = dateStr ? new Date(dateStr) : new Date();
    const result = await this.cropGrowthService.evaluateFarmCropById(farmCropId, {
      persist: false,
      referenceDate,
    });
    return {
      message: `Preview calculated for FarmCrop #${farmCropId}`,
      data: result,
    };
  }
}
