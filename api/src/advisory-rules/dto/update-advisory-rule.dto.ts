import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvisoryRuleDto } from './create-advisory-rule.dto';

export class UpdateAdvisoryRuleDto extends PartialType(CreateAdvisoryRuleDto) {}
