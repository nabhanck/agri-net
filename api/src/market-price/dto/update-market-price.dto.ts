import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketPriceDto } from './create-market-price.dto';

export class UpdateMarketPriceDto extends PartialType(CreateMarketPriceDto) {}
