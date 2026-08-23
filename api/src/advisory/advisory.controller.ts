import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdvisoryService } from './advisory.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';

@Controller('advisory')
export class AdvisoryController {
  constructor(private readonly advisoryService: AdvisoryService) {}

  @Post()
  create(@Body() createAdvisoryDto: CreateAdvisoryDto) {
    return this.advisoryService.create(createAdvisoryDto);
  }

  @Get()
  findAll() {
    return this.advisoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advisoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdvisoryDto: UpdateAdvisoryDto) {
    return this.advisoryService.update(+id, updateAdvisoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisoryService.remove(+id);
  }
}
