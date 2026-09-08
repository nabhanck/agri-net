import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrowthStage } from './entities/growth-stage.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { CreateGrowthStageDto } from './dto/create-growth-stage.dto';
import { UpdateGrowthStageDto } from './dto/update-growth-stage.dto';

export const RICE_GROWTH_STAGES = [
  { stage_order: 1, stage_name: 'Germination', duration_days: 10, description: 'Seed germination and seedling emergence stage' },
  { stage_order: 2, stage_name: 'Tillering', duration_days: 25, description: 'Vegetative phase with tiller production and leaf development' },
  { stage_order: 3, stage_name: 'Panicle Initiation', duration_days: 20, description: 'Reproductive transition and panicle development inside stem' },
  { stage_order: 4, stage_name: 'Flowering', duration_days: 20, description: 'Anthesis and pollination stage' },
  { stage_order: 5, stage_name: 'Grain Filling', duration_days: 25, description: 'Milky, dough, and ripening stages of grain development' },
  { stage_order: 6, stage_name: 'Maturity', duration_days: 20, description: 'Grain reaches full maturity and harvest readiness' },
];

@Injectable()
export class CropsGrowthStagesService implements OnModuleInit {
  private readonly logger = new Logger(CropsGrowthStagesService.name);

  constructor(
    @InjectRepository(GrowthStage)
    private readonly growthStageRepository: Repository<GrowthStage>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
  ) {}

  async onModuleInit() {
    try {
      await this.seedRiceGrowthStages();
    } catch (error) {
      this.logger.warn(`Rice growth stage seeding skipped or deferred: ${(error as Error).message}`);
    }
  }

  async create(createGrowthStageDto: CreateGrowthStageDto): Promise<GrowthStage> {
    const { crop_id, stage_name, stage_order, duration_days, description } = createGrowthStageDto;

    const crop = await this.cropRepository.findOne({ where: { id: crop_id } });
    if (!crop) {
      throw new NotFoundException(`Crop with ID ${crop_id} not found`);
    }

    const growthStage = this.growthStageRepository.create({
      crop,
      crop_id,
      stage_name,
      stage_order,
      duration_days: duration_days ?? 0,
      description,
    });

    return await this.growthStageRepository.save(growthStage);
  }

  async findAll(cropId?: number): Promise<GrowthStage[]> {
    if (cropId) {
      return await this.growthStageRepository.find({
        where: { crop_id: cropId },
        order: { stage_order: 'ASC' },
        relations: { crop: true },
      });
    }

    return await this.growthStageRepository.find({
      order: { crop_id: 'ASC', stage_order: 'ASC' },
      relations: { crop: true },
    });
  }

  async findByCrop(cropId: number): Promise<GrowthStage[]> {
    const crop = await this.cropRepository.findOne({ where: { id: cropId } });
    if (!crop) {
      throw new NotFoundException(`Crop with ID ${cropId} not found`);
    }

    return await this.growthStageRepository.find({
      where: { crop_id: cropId },
      order: { stage_order: 'ASC' },
      relations: { crop: true },
    });
  }

  async findOne(id: number): Promise<GrowthStage> {
    const growthStage = await this.growthStageRepository.findOne({
      where: { id },
      relations: { crop: true },
    });

    if (!growthStage) {
      throw new NotFoundException(`Growth stage with ID ${id} not found`);
    }

    return growthStage;
  }

  async update(id: number, updateGrowthStageDto: UpdateGrowthStageDto): Promise<GrowthStage> {
    const growthStage = await this.growthStageRepository.findOne({
      where: { id },
      relations: { crop: true },
    });

    if (!growthStage) {
      throw new NotFoundException(`Growth stage with ID ${id} not found`);
    }

    if (updateGrowthStageDto.crop_id && updateGrowthStageDto.crop_id !== growthStage.crop_id) {
      const crop = await this.cropRepository.findOne({ where: { id: updateGrowthStageDto.crop_id } });
      if (!crop) {
        throw new NotFoundException(`Crop with ID ${updateGrowthStageDto.crop_id} not found`);
      }
      growthStage.crop = crop;
      growthStage.crop_id = crop.id;
    }

    if (updateGrowthStageDto.stage_name !== undefined) {
      growthStage.stage_name = updateGrowthStageDto.stage_name;
    }
    if (updateGrowthStageDto.stage_order !== undefined) {
      growthStage.stage_order = updateGrowthStageDto.stage_order;
    }
    if (updateGrowthStageDto.duration_days !== undefined) {
      growthStage.duration_days = updateGrowthStageDto.duration_days;
    }
    if (updateGrowthStageDto.description !== undefined) {
      growthStage.description = updateGrowthStageDto.description;
    }

    return await this.growthStageRepository.save(growthStage);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const growthStage = await this.findOne(id);
    await this.growthStageRepository.remove(growthStage);
    return {
      message: `Growth stage #${id} removed successfully`,
      id,
    };
  }

  async seedRiceGrowthStages(): Promise<{ message: string; stages?: GrowthStage[] }> {
    // Find rice crop by slug or case-insensitive name
    const riceCrop = await this.cropRepository
      .createQueryBuilder('crop')
      .where('LOWER(crop.slug) = :slug OR LOWER(crop.name) = :name', {
        slug: 'rice',
        name: 'rice',
      })
      .getOne();

    if (!riceCrop) {
      this.logger.log('Rice crop not found in database. Skipping growth stage seeding until Rice crop is created.');
      return { message: 'Rice crop not found in database. No stages seeded.' };
    }

    const seededStages: GrowthStage[] = [];

    for (const stageDef of RICE_GROWTH_STAGES) {
      let stage = await this.growthStageRepository.findOne({
        where: [
          { crop_id: riceCrop.id, stage_order: stageDef.stage_order },
          { crop_id: riceCrop.id, stage_name: stageDef.stage_name },
        ],
      });

      if (!stage) {
        stage = this.growthStageRepository.create({
          crop: riceCrop,
          crop_id: riceCrop.id,
          stage_name: stageDef.stage_name,
          stage_order: stageDef.stage_order,
          duration_days: stageDef.duration_days,
          description: stageDef.description,
        });
      } else {
        stage.stage_name = stageDef.stage_name;
        stage.stage_order = stageDef.stage_order;
        stage.duration_days = stageDef.duration_days;
        if (stageDef.description && !stage.description) {
          stage.description = stageDef.description;
        }
      }

      const savedStage = await this.growthStageRepository.save(stage);
      seededStages.push(savedStage);
    }

    this.logger.log(`Successfully seeded ${seededStages.length} growth stages for Rice (Crop ID: ${riceCrop.id}).`);
    return {
      message: `Successfully seeded ${seededStages.length} growth stages for Rice crop`,
      stages: seededStages,
    };
  }
}
