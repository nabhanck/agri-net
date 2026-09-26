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
import { MarketPriceService } from './market-price.service';
import { CreateMarketPriceDto } from './dto/create-market-price.dto';
import { UpdateMarketPriceDto } from './dto/update-market-price.dto';
import { FetchMarketPriceDto } from './dto/fetch-market-price.dto';

@Controller('market-price')
export class MarketPriceController {
  constructor(private readonly marketPriceService: MarketPriceService) {}

  /**
   * Primary endpoint to fetch live / cached government mandi crop prices
   * e.g. GET /market-price?commodity=Rice&state=Kerala&limit=100&farm_id=1&crop_id=1&farm_crop_id=1
   */
  @Get()
  async getMarketPrices(@Query() query: FetchMarketPriceDto) {
    // If no commodity was passed in query, default to "Rice"
    if (!query.commodity) {
      query.commodity = 'Rice';
    }
    return await this.marketPriceService.fetchLiveMarketPrices(query);
  }

  /**
   * Direct commodity lookup endpoint
   * e.g. GET /market-price/commodity/Rice?state=Kerala&limit=50
   */
  @Get('commodity/:commodity')
  async getByCommodity(
    @Param('commodity') commodity: string,
    @Query('limit') limit?: number,
  ) {
    return await this.marketPriceService.fetchLiveMarketPrices({
      commodity,
      limit: limit ? Number(limit) : 100,
    });
  }

  /**
   * Query all stored historical market price records in DB
   */
  @Get('history')
  async findAll(
    @Query('commodity') commodity?: string,
    @Query('state') state?: string,
  ) {
    return await this.marketPriceService.findAll(commodity, state);
  }

  /**
   * Get specific market price record by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.marketPriceService.findOne(id);
  }

  /**
   * Manually create a market price record
   */
  @Post()
  async create(@Body() createMarketPriceDto: CreateMarketPriceDto) {
    return await this.marketPriceService.create(createMarketPriceDto);
  }

  /**
   * Update a market price record
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMarketPriceDto: UpdateMarketPriceDto,
  ) {
    return await this.marketPriceService.update(id, updateMarketPriceDto);
  }

  /**
   * Delete a market price record
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.marketPriceService.remove(id);
  }
}
