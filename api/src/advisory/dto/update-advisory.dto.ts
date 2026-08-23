import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvisoryDto } from './create-advisory.dto';

export class UpdateAdvisoryDto extends PartialType(CreateAdvisoryDto) {}
