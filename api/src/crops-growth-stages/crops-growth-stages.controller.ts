import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CropsGrowthStagesService } from './crops-growth-stages.service';
import { CreateGrowthStageDto } from './dto/create-growth-stage.dto';
import { UpdateGrowthStageDto } from './dto/update-growth-stage.dto';

@Controller('crops-growth-stages')
export class CropsGrowthStagesController {
  constructor(
    private readonly cropsGrowthStagesService: CropsGrowthStagesService,
  ) {}

  @Post()
  async create(@Body() createGrowthStageDto: CreateGrowthStageDto) {
    const data = await this.cropsGrowthStagesService.create(createGrowthStageDto);
    return {
      message: 'Growth stage created successfully',
      data,
    };
  }

  @Get()
  findAll(@Query('crop_id') cropId?: string) {
    return this.cropsGrowthStagesService.findAll(cropId ? +cropId : undefined);
  }

  @Get('crop/:cropId')
  findByCrop(@Param('cropId', ParseIntPipe) cropId: number) {
    return this.cropsGrowthStagesService.findByCrop(cropId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cropsGrowthStagesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGrowthStageDto: UpdateGrowthStageDto,
  ) {
    const data = await this.cropsGrowthStagesService.update(id, updateGrowthStageDto);
    return {
      message: 'Growth stage updated successfully',
      data,
    };
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cropsGrowthStagesService.remove(id);
  }

  @Post('seed/rice')
  seedRice() {
    return this.cropsGrowthStagesService.seedRiceGrowthStages();
  }
}
