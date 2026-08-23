import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdvisoryRulesService } from './advisory-rules.service';
import { CreateAdvisoryRuleDto } from './dto/create-advisory-rule.dto';
import { UpdateAdvisoryRuleDto } from './dto/update-advisory-rule.dto';

@Controller('advisory-rules')
export class AdvisoryRulesController {
  constructor(private readonly advisoryRulesService: AdvisoryRulesService) {}

  @Post()
  async create(@Body() createAdvisoryRuleDto: CreateAdvisoryRuleDto) {
    const advisoryRule = await this.advisoryRulesService.create(createAdvisoryRuleDto);

    return {
      message: 'Advisory rule created successfully',
      data: advisoryRule
    };
  }

  @Get()
  findAll() {
    return this.advisoryRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advisoryRulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdvisoryRuleDto: UpdateAdvisoryRuleDto) {
    return this.advisoryRulesService.update(+id, updateAdvisoryRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisoryRulesService.remove(+id);
  }
}
