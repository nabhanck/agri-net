import { Test, TestingModule } from '@nestjs/testing';
import { CropsGrowthStagesService, RICE_GROWTH_STAGES } from './crops-growth-stages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GrowthStage } from './entities/growth-stage.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { NotFoundException } from '@nestjs/common';

describe('CropsGrowthStagesService', () => {
  let service: CropsGrowthStagesService;
  let growthStageRepo: any;
  let cropRepo: any;

  const mockCrop: Partial<Crop> = {
    id: 1,
    name: 'Rice',
    slug: 'rice',
  };

  const mockGrowthStage: Partial<GrowthStage> = {
    id: 1,
    crop_id: 1,
    stage_name: 'Germination',
    stage_order: 1,
    description: 'Seed germination',
    crop: mockCrop as Crop,
  };

  beforeEach(async () => {
    growthStageRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((stage) => Promise.resolve({ id: 1, ...stage })),
      find: jest.fn().mockResolvedValue([mockGrowthStage]),
      findOne: jest.fn().mockResolvedValue(mockGrowthStage),
      remove: jest.fn().mockResolvedValue(mockGrowthStage),
    };

    cropRepo = {
      findOne: jest.fn().mockResolvedValue(mockCrop),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCrop),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropsGrowthStagesService,
        {
          provide: getRepositoryToken(GrowthStage),
          useValue: growthStageRepo,
        },
        {
          provide: getRepositoryToken(Crop),
          useValue: cropRepo,
        },
      ],
    }).compile();

    service = module.get<CropsGrowthStagesService>(CropsGrowthStagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a growth stage for a valid crop', async () => {
      const dto = {
        crop_id: 1,
        stage_name: 'Germination',
        stage_order: 1,
        description: 'Germination stage',
      };

      const result = await service.create(dto);
      expect(cropRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(growthStageRepo.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if crop does not exist', async () => {
      cropRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create({
          crop_id: 999,
          stage_name: 'Tillering',
          stage_order: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all growth stages ordered by stage_order when cropId is provided', async () => {
      const result = await service.findAll(1);
      expect(growthStageRepo.find).toHaveBeenCalledWith({
        where: { crop_id: 1 },
        order: { stage_order: 'ASC' },
        relations: { crop: true },
      });
      expect(result).toEqual([mockGrowthStage]);
    });

    it('should return all growth stages ordered when cropId is not provided', async () => {
      await service.findAll();
      expect(growthStageRepo.find).toHaveBeenCalledWith({
        order: { crop_id: 'ASC', stage_order: 'ASC' },
        relations: { crop: true },
      });
    });
  });

  describe('findByCrop', () => {
    it('should return stages for a crop ordered by stage_order', async () => {
      const result = await service.findByCrop(1);
      expect(cropRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(growthStageRepo.find).toHaveBeenCalledWith({
        where: { crop_id: 1 },
        order: { stage_order: 'ASC' },
        relations: { crop: true },
      });
      expect(result).toEqual([mockGrowthStage]);
    });

    it('should throw NotFoundException if crop is not found', async () => {
      cropRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findByCrop(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('seedRiceGrowthStages', () => {
    it('should seed 6 stages for rice in lifecycle order', async () => {
      growthStageRepo.findOne.mockResolvedValue(null);
      const result = await service.seedRiceGrowthStages();
      expect(result.message).toContain('Successfully seeded 6 growth stages for Rice crop');
      expect(result.stages?.length).toBe(6);
      expect(RICE_GROWTH_STAGES.map((s) => ({ name: s.stage_name, days: s.duration_days }))).toEqual([
        { name: 'Germination', days: 10 },
        { name: 'Tillering', days: 25 },
        { name: 'Panicle Initiation', days: 20 },
        { name: 'Flowering', days: 20 },
        { name: 'Grain Filling', days: 25 },
        { name: 'Maturity', days: 20 },
      ]);
    });

    it('should gracefully handle missing rice crop without duplicating', async () => {
      cropRepo.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.seedRiceGrowthStages();
      expect(result.message).toContain('Rice crop not found in database');
    });
  });
});
