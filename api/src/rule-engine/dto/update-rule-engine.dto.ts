import { PartialType } from '@nestjs/mapped-types';
import { CreateRuleEngineDto } from './create-rule-engine.dto';

export class UpdateRuleEngineDto extends PartialType(CreateRuleEngineDto) {}
