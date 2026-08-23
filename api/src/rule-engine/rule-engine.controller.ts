import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { CreateRuleEngineDto } from './dto/create-rule-engine.dto';
import { UpdateRuleEngineDto } from './dto/update-rule-engine.dto';
import type { FarmObservation } from './types/farm-observation.type';

@Controller('rule-engine')
export class RuleEngineController {
  constructor(private readonly ruleEngineService: RuleEngineService) {}

  @Post()
  create(@Body() createRuleEngineDto: CreateRuleEngineDto) {
    return this.ruleEngineService.create(createRuleEngineDto);
  }

  @Post('evaluate')
  async evaluate(@Body() observation: FarmObservation) {
    const triggeredRules = await this.ruleEngineService.evaluate(observation);
    
    return {
      message: 'Observation evaluated successfully',
      data: {
        observation,
        triggeredRules
      }
    }
  }

  @Get()
  findAll() {
    return this.ruleEngineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ruleEngineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRuleEngineDto: UpdateRuleEngineDto) {
    return this.ruleEngineService.update(+id, updateRuleEngineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ruleEngineService.remove(+id);
  }
}
