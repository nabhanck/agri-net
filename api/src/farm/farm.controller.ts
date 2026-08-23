import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';

@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  async create(@Body() createFarmDto: CreateFarmDto) {
    const farm = await this.farmService.create(createFarmDto);
    return {
      message: 'Farm created successfully.',
      data: farm
    }
  }

  @Get()
  findAll() {
    return this.farmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmService.findOne(+id);
  }

  @Get(':id/intelligence')
  farmEvaluation(@Param('id') id: string) {
    return this.farmService.farmEvaluation(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmService.update(+id, updateFarmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmService.remove(+id);
  }
}
