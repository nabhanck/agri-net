import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { WeatherService } from 'src/weather/weather.service';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { GrowthStage } from 'src/crops-growth-stages/entities/growth-stage.entity';
import { RuleEngineService } from 'src/rule-engine/rule-engine.service';
import { CropEvaluation, CurrentData } from 'src/types/cropEvaluation';
import { GeminiService } from 'src/AI/gemini.service';
import { RuleOccurrence } from 'src/types/ruleOccurenceType';
import { RuleEvaluation } from 'src/types/ruleEvaluation';
import { DailyEvaluation, HourlyEvaluation } from 'src/types/hourlyEvaluation';
import { FarmCropAdvisory } from './entities/farm_crop_advisory.entity';

@Injectable()
export class FarmService {
  constructor(
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Crop)
    private cropRepository: Repository<Crop>,

    @InjectRepository(FarmCrop)
    private farmCropRepository: Repository<FarmCrop>,

    @InjectRepository(FarmCropAdvisory)
    private readonly farmCropAdvisoryRepository: Repository<FarmCropAdvisory>,

    @InjectRepository(GrowthStage)
    private growthStageRepository: Repository<GrowthStage>,

    private weatherService: WeatherService,

    private ruleEngineService: RuleEngineService,

    private readonly geminiService: GeminiService,
  ) {}

  private withFallback(evaluation: any[]) {
    const NO_RISK_MESSAGE =
      'No risks detected for the current conditions.';

    return evaluation.length > 0
      ? evaluation
      : [
          {
            ruleId: null,
            ruleCode: 'NO_RISK',
            riskLevel: 'NONE',
            riskType: null,
            category: null,
            priority: null,
            message: NO_RISK_MESSAGE,
          },
        ];
  }

  private collectRuleOccurrences(
    current: CurrentData | null,
    hourly: HourlyEvaluation[],
    daily: DailyEvaluation[],
  ): RuleOccurrence[] {
    const map = new Map<string, RuleOccurrence>();

    const add = (
      time: string,
      temperature: number,
      humidity: number,
      rules: RuleEvaluation[] | null,
    ) => {
      if (!rules) return; // guard against null

      for (const rule of rules) {
        if (rule.ruleCode === 'NO_RISK') continue;
        if (!map.has(rule.ruleCode)) {
          map.set(rule.ruleCode, {
            ruleCode: rule.ruleCode,
            riskLevel: rule.riskLevel,
            riskType: rule.riskType,
            category: rule.category,
            message: rule.message,
            occurrences: [],
          });
        }
        map.get(rule.ruleCode)!.occurrences.push({ time, temperature, humidity });
      }
    };

    if (current) {
      add('now', current.temperature, current.humidity, current.evaluation);
    }
    for (const h of hourly) {
      add(h.time, h.temperature, h.humidity, h.evaluation);
    }
    for (const d of daily) {
      if (d.forecast_date) {
        add(d.forecast_date, d.temperature ?? 0, d.humidity ?? 0, d.evaluation);
      }
    }

    return Array.from(map.values());
  }

  async create(createFarmDto: CreateFarmDto) {
    const {
      user_id,
      name,
      latitude,
      longitude,
      area,
      soil_type,
      irrigation_type,
      farming_practice,
      crop_Ids,
      crops: inputCrops,
      soilPh,
    } = createFarmDto;

    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const existingFarm = await this.farmRepository.findOne({
      where: {
        name,
        user: { id: user.id },
      },
    });

    if (existingFarm) {
      throw new ConflictException(
        `You already have a farm named "${name}".`,
      );
    }

    // Normalize crop input: support either crops array or legacy crop_Ids array
    type CropItemInput = {
      crop_id: number;
      variety?: string;
      planting_date?: Date | string;
      growth_stage_id?: number;
      is_active?: boolean;
      status?: string;
    };

    let cropItems: CropItemInput[] = [];

    if (inputCrops && Array.isArray(inputCrops) && inputCrops.length > 0) {
      cropItems = inputCrops.map((c: any) => ({
        crop_id: Number(c.crop_id ?? c.cropId),
        variety: c.variety,
        planting_date: c.planting_date ?? c.plantingDate,
        growth_stage_id:
          c.growth_stage_id !== undefined && c.growth_stage_id !== null
            ? Number(c.growth_stage_id)
            : c.growthStageId !== undefined && c.growthStageId !== null
            ? Number(c.growthStageId)
            : undefined,
        is_active: c.is_active ?? c.isActive ?? true,
        status: c.status ?? 'active',
      }));
    } else if (crop_Ids && Array.isArray(crop_Ids) && crop_Ids.length > 0) {
      cropItems = crop_Ids.map((id) => ({
        crop_id: Number(id),
      }));
    }

    // Validate crop references
    let catalogCrops: Crop[] = [];
    if (cropItems.length > 0) {
      const distinctCropIds = Array.from(new Set(cropItems.map((c) => c.crop_id)));
      catalogCrops = await this.cropRepository.findBy({ id: In(distinctCropIds) });
      if (catalogCrops.length !== distinctCropIds.length) {
        const foundIds = catalogCrops.map((c) => c.id);
        const missing = distinctCropIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(`Crop(s) not found: ${missing.join(', ')}`);
      }
    }

    // Validate growth stage references if provided
    const growthStageIds = cropItems
      .map((c) => c.growth_stage_id)
      .filter((id): id is number => typeof id === 'number' && !isNaN(id));

    if (growthStageIds.length > 0) {
      const distinctStageIds = Array.from(new Set(growthStageIds));
      const stages = await this.growthStageRepository.findBy({ id: In(distinctStageIds) });
      if (stages.length !== distinctStageIds.length) {
        const foundStageIds = stages.map((s) => s.id);
        const missingStages = distinctStageIds.filter((id) => !foundStageIds.includes(id));
        throw new NotFoundException(`Growth stage(s) not found: ${missingStages.join(', ')}`);
      }
    }

    const newFarm = this.farmRepository.create({
      user: user,
      name,
      latitude,
      longitude,
      area,
      soil_type,
      irrigation_type,
      farming_practice,
      soilPh,
    });

    const savedFarm = await this.farmRepository.save(newFarm);

    if (cropItems.length > 0) {
      const cropMap = new Map(catalogCrops.map((c) => [c.id, c]));

      const farmCrops = cropItems.map((item) => {
        let parsedDate: Date | undefined;
        if (item.planting_date) {
          const d = new Date(item.planting_date);
          if (!isNaN(d.getTime())) {
            parsedDate = d;
          }
        }

        return this.farmCropRepository.create({
          farm: savedFarm,
          farm_id: savedFarm.id,
          crop: cropMap.get(item.crop_id),
          crop_id: item.crop_id,
          variety: item.variety,
          planting_date: parsedDate,
          growth_stage_id: item.growth_stage_id,
          is_active: item.is_active ?? true,
          status: item.status ?? 'active',
        });
      });

      await this.farmCropRepository.save(farmCrops);
    }

    return this.farmRepository.findOne({
      where: { id: savedFarm.id },
      relations: {
        crops: {
          crop: true,
          growth_stage: true,
        },
      },
    });
  }

  async farmEvaluation(id: number) {
    const farm = await this.farmRepository.findOne({
      where: { id },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with id ${id} not found`);
    }

    const farmCrop = await this.farmCropRepository.find({
      where: {
        farm_id: id,
      },
      relations: {
        crop: true,
        growth_stage: true,
      },
    });

    const weather = await this.weatherService.getWeather(
      Number(farm.latitude),
      Number(farm.longitude),
      Number(id)
    );

    if (!weather.current) {
      throw new NotFoundException(
        `No current weather data available for farm ${id}`,
      );
    }

    const results: CropEvaluation[] = [];

    for (const item of farmCrop) {
      const growthStageName = item.growth_stage?.stage_name || '';

      const currentEvaluation = this.withFallback(
          await this.ruleEngineService.evaluate({
          cropId: item.crop?.id,
          growthStage: growthStageName,
          temperature: weather.current.temperature_2m,
          humidity: weather.current.relative_humidity_2m,
          soilPh: farm.soilPh,
        })
      );

      const cropResult: CropEvaluation = {
        cropId: item.crop?.id,
        growthStage: growthStageName,
        current: {
          temperature: weather.current.temperature_2m,
          humidity: weather.current.relative_humidity_2m,
          evaluation: currentEvaluation,
        },
        hourly: [],
        daily: [],
        triggeredRisks: [],
        advisory: null,
      };

      cropResult.hourly = await Promise.all(
        weather.hourly.map(async (hour) => {
          const evaluation = this.withFallback(
            await this.ruleEngineService.evaluate({
              cropId: item.crop?.id,
              growthStage: growthStageName,
              temperature: hour.temperature_2m,
              humidity: hour.relative_humidity_2m,
              soilPh: farm.soilPh,
            })
          )

          return {
            time: hour.forecast_time,
            temperature: hour.temperature_2m,
            humidity: hour.relative_humidity_2m,
            evaluation,
          };
        }),
      );

      const ruleOccurrences = this.collectRuleOccurrences(
        cropResult.current,
        cropResult.hourly,
        cropResult.daily,
      );

      cropResult.triggeredRisks = ruleOccurrences;

      if (ruleOccurrences.length > 0) {
        cropResult.advisory = await this.geminiService.generateAdvisory({
          cropName: item.crop?.name,
          stage: growthStageName,
          triggeredRules: ruleOccurrences,
          weather: weather,
        });

        const advisoryRecord = this.farmCropAdvisoryRepository.create({
          farm_crop_id: item.id,
          growth_stage: growthStageName,
          triggered_risks: ruleOccurrences,
          advisory: cropResult.advisory,
        });

        await this.farmCropAdvisoryRepository.save(advisoryRecord);

      }

      results.push(cropResult);
    }

    return {
      farmId: farm.id,
      farmName: farm.name,
      results,
    };
  }

  async findAll() {
    return await this.farmRepository.find({
      relations: {
        crops: {
          crop: true,
          growth_stage: true,
        },
      },
    });
  }

  async findOne(id: number) {
    const farm = await this.farmRepository.findOne({
      where: { id },
      relations: {
        crops: {
          crop: true,
          growth_stage: true,
        },
      },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with id ${id} not found`);
    }

    return farm;
  }

  update(id: number, updateFarmDto: UpdateFarmDto) {
    return `This action updates a #${id} farm`;
  }

  remove(id: number) {
    return `This action removes a #${id} farm`;
  }
}
