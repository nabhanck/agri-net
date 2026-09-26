import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MarketPrice } from './entities/market-price.entity';
import { Farm } from 'src/farm/entities/farm.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { CreateMarketPriceDto } from './dto/create-market-price.dto';
import { UpdateMarketPriceDto } from './dto/update-market-price.dto';
import { FetchMarketPriceDto } from './dto/fetch-market-price.dto';

@Injectable()
export class MarketPriceService {
  private readonly logger = new Logger(MarketPriceService.name);
  private readonly GOV_API_RESOURCE_URL =
    'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  constructor(
    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,

    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(FarmCrop)
    private readonly farmCropRepository: Repository<FarmCrop>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Fetch real-time market prices from the Government Data API (data.gov.in Agmarknet)
   * and sync with database associated to farm, crop, or farmCrop.
   */
  async fetchLiveMarketPrices(query: FetchMarketPriceDto) {
    const {
      commodity,
      state,
      district,
      market,
      farm_id,
      crop_id,
      farm_crop_id,
      limit = 100,
      offset = 0,
      force_refresh = false,
    } = query;

    const apiKey =
      this.configService.get<string>('GOV_DATA_API') ||
      process.env.GOV_DATA_API ||
      '579b464db66ec23bdd0000017bce60fe48e740757adfd95746ed589f';

    // Verify relations if IDs were provided
    let farm: Farm | null = null;
    let crop: Crop | null = null;
    let farmCrop: FarmCrop | null = null;

    if (farm_id) {
      farm = await this.farmRepository.findOne({ where: { id: farm_id } });
    }
    if (crop_id) {
      crop = await this.cropRepository.findOne({ where: { id: crop_id } });
    }
    if (farm_crop_id) {
      farmCrop = await this.farmCropRepository.findOne({
        where: { id: farm_crop_id },
        relations: { crop: true, farm: true },
      });
      if (farmCrop) {
        if (!farm && farmCrop.farm) farm = farmCrop.farm;
        if (!crop && farmCrop.crop) crop = farmCrop.crop;
      }
    }

    // 1. Check if database has data for the current date for this commodity (skip refetch if present)
    if (!force_refresh) {
      const now = new Date();
      // Midnight start of current day (00:00:00.000)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      // Formats commonly used in Agmarknet arrival_date (e.g., "24/09/2026", "24-09-2026", "2026-09-24")
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      const arrivalDateSlash = `${day}/${month}/${year}`;
      const arrivalDateDash = `${day}-${month}-${year}`;
      const arrivalDateISO = `${year}-${month}-${day}`;

      const queryBuilder = this.marketPriceRepository
        .createQueryBuilder('mp')
        .where('LOWER(mp.commodity) = LOWER(:commodity)', { commodity })
        .andWhere(
          '(mp.fetched_at >= :startOfToday OR mp.arrival_date = :arrivalDateSlash OR mp.arrival_date = :arrivalDateDash OR mp.arrival_date = :arrivalDateISO)',
          {
            startOfToday,
            arrivalDateSlash,
            arrivalDateDash,
            arrivalDateISO,
          },
        );

      if (farm_id) {
        queryBuilder.andWhere('mp.farm_id = :farm_id', { farm_id });
      }

      const cachedRecords = await queryBuilder
        .orderBy('mp.fetched_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getMany();

      if (cachedRecords.length > 0) {
        this.logger.log(
          `DB already has ${cachedRecords.length} records for current date (${arrivalDateSlash}) for commodity: "${commodity}". Skipping external refetch.`,
        );
        return this.buildMarketPriceResponse(commodity, cachedRecords, 'cache');
      }
    }

    // Build Government Data API query parameters strictly:
    // https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=API_KEY&format=json&filters[commodity]=Rice&limit=100
    const params: Record<string, any> = {
      'api-key': apiKey,
      format: 'json',
      'filters[commodity]': commodity,
      limit,
    };

    try {
      this.logger.log(
        `Fetching live Mandi market prices for commodity: "${commodity}" from data.gov.in...`,
      );

      const response = await firstValueFrom(
        this.httpService.get(this.GOV_API_RESOURCE_URL, {
          params,
          timeout: 10000,
        }),
      );

      const records = response.data?.records || [];
      this.logger.log(
        `Received ${records.length} mandi records from Government API for ${commodity}`,
      );

      // Map and persist fetched records
      const savedEntities: MarketPrice[] = [];
      const now = new Date();

      for (const item of records) {
        const minPrice = item.min_price ? parseFloat(item.min_price) : undefined;
        const maxPrice = item.max_price ? parseFloat(item.max_price) : undefined;
        const modalPrice = item.modal_price ? parseFloat(item.modal_price) : undefined;

        const newEntry = this.marketPriceRepository.create({
          farm_id: farm?.id || farm_id,
          farm: farm || undefined,
          crop_id: crop?.id || crop_id,
          crop: crop || undefined,
          farm_crop_id: farmCrop?.id || farm_crop_id,
          farm_crop: farmCrop || undefined,
          state: item.state || state,
          district: item.district || district,
          market: item.market || item.market_name || market,
          commodity: item.commodity || commodity,
          variety: item.variety,
          grade: item.grade,
          arrival_date: item.arrival_date,
          min_price: isNaN(minPrice as any) ? undefined : minPrice,
          max_price: isNaN(maxPrice as any) ? undefined : maxPrice,
          modal_price: isNaN(modalPrice as any) ? undefined : modalPrice,
          currency: 'INR',
          raw_data: item,
          fetched_at: now,
        });

        const saved = await this.marketPriceRepository.save(newEntry);
        savedEntities.push(saved);
      }

      return this.buildMarketPriceResponse(
        commodity,
        savedEntities.length > 0 ? savedEntities : records,
        'live_government_api',
        response.data?.total || records.length,
      );
    } catch (error: any) {
      this.logger.warn(
        `Government data API request failed (${error?.message}). Falling back to local database records...`,
      );

      // Fallback: Query any previously stored prices from DB
      const fallbackRecords = await this.marketPriceRepository.find({
        where: { commodity },
        order: { fetched_at: 'DESC' },
        take: limit,
      });

      if (fallbackRecords.length > 0) {
        return this.buildMarketPriceResponse(commodity, fallbackRecords, 'fallback_db');
      }

      // If no records in DB either, return structured graceful response
      return {
        status: 'warning',
        source: 'unavailable',
        commodity,
        message:
          'Unable to reach Government Mandi API and no cached records exist for this commodity.',
        total: 0,
        averageModalPrice: 0,
        minModalPrice: 0,
        maxModalPrice: 0,
        records: [],
      };
    }
  }

  /**
   * Helper to format statistics and records for frontend consumption
   */
  private buildMarketPriceResponse(
    commodity: string,
    records: any[],
    source: 'live_government_api' | 'cache' | 'fallback_db',
    totalCount?: number,
  ) {
    const validPrices = records
      .map((r) => parseFloat(r.modal_price || r.modalPrice))
      .filter((p) => !isNaN(p) && p > 0);

    const averageModalPrice =
      validPrices.length > 0
        ? Math.round(
          validPrices.reduce((acc, val) => acc + val, 0) / validPrices.length,
        )
        : 0;

    const minModalPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const maxModalPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

    const states = Array.from(new Set(records.map((r) => r.state).filter(Boolean)));
    const markets = Array.from(new Set(records.map((r) => r.market).filter(Boolean)));

    return {
      status: 'success',
      source,
      commodity,
      total: totalCount || records.length,
      count: records.length,
      unit: '₹ / Quintal (100 kg)',
      averageModalPrice,
      minModalPrice,
      maxModalPrice,
      marketsCount: markets.length,
      statesCovered: states,
      records,
    };
  }

  // CRUD Operations
  async create(createMarketPriceDto: CreateMarketPriceDto) {
    const marketPrice = this.marketPriceRepository.create(createMarketPriceDto);
    return await this.marketPriceRepository.save(marketPrice);
  }

  async findAll(commodity?: string, state?: string) {
    const where: any = {};
    if (commodity) where.commodity = commodity;
    if (state) where.state = state;

    return await this.marketPriceRepository.find({
      where,
      relations: {
        farm: true,
        crop: true,
        farm_crop: true,
      },
      order: { fetched_at: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: number) {
    const record = await this.marketPriceRepository.findOne({
      where: { id },
      relations: {
        farm: true,
        crop: true,
        farm_crop: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Market price record #${id} not found`);
    }

    return record;
  }

  async update(id: number, updateMarketPriceDto: UpdateMarketPriceDto) {
    const record = await this.findOne(id);
    Object.assign(record, updateMarketPriceDto);
    return await this.marketPriceRepository.save(record);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return await this.marketPriceRepository.remove(record);
  }
}
