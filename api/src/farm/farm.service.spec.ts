import { Test, TestingModule } from '@nestjs/testing';
import { FarmService } from './farm.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { User } from 'src/user/entities/user.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { FarmCropAdvisory } from './entities/farm_crop_advisory.entity';
import { GrowthStage } from 'src/crops-growth-stages/entities/growth-stage.entity';
import { WeatherService } from 'src/weather/weather.service';
import { RuleEngineService } from 'src/rule-engine/rule-engine.service';
import { GeminiService } from 'src/AI/gemini.service';

describe('FarmService', () => {
  let service: FarmService;
  let farmRepo: any;
  let userRepo: any;
  let cropRepo: any;
  let farmCropRepo: any;
  let growthStageRepo: any;

  beforeEach(async () => {
    farmRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((farm) => Promise.resolve({ id: 1, ...farm })),
      find: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Farmer' }),
    };

    cropRepo = {
      findBy: jest.fn().mockResolvedValue([{ id: 1, name: 'Rice' }]),
    };

    farmCropRepo = {
      create: jest.fn((dto) => ({ id: 10, ...dto })),
      save: jest.fn((items) => Promise.resolve(items)),
      find: jest.fn(),
    };

    growthStageRepo = {
      findBy: jest.fn().mockResolvedValue([{ id: 2, stage_name: 'Tillering', crop_id: 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmService,
        { provide: getRepositoryToken(Farm), useValue: farmRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Crop), useValue: cropRepo },
        { provide: getRepositoryToken(FarmCrop), useValue: farmCropRepo },
        { provide: getRepositoryToken(FarmCropAdvisory), useValue: {} },
        { provide: getRepositoryToken(GrowthStage), useValue: growthStageRepo },
        { provide: WeatherService, useValue: {} },
        { provide: RuleEngineService, useValue: {} },
        { provide: GeminiService, useValue: {} },
      ],
    }).compile();

    service = module.get<FarmService>(FarmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a farm with crop variety, planting_date, and growth_stage_id', async () => {
    farmRepo.findOne
      .mockResolvedValueOnce(null) // existingFarm check
      .mockResolvedValueOnce({
        id: 1,
        name: 'Green Acres',
        crops: [
          {
            id: 10,
            crop_id: 1,
            variety: 'IR64',
            planting_date: new Date('2026-08-10'),
            growth_stage_id: 2,
            crop: { id: 1, name: 'Rice' },
            growth_stage: { id: 2, stage_name: 'Tillering' },
          },
        ],
      });

    const result = await service.create({
      user_id: 1,
      name: 'Green Acres',
      latitude: 10.0,
      longitude: 76.0,
      crops: [
        {
          crop_id: 1,
          variety: 'IR64',
          planting_date: '2026-08-10',
          growth_stage_id: 2,
        },
      ],
    });

    expect(result).toBeDefined();
    expect(farmCropRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        crop_id: 1,
        variety: 'IR64',
        growth_stage_id: 2,
      }),
    );
    expect(farmCropRepo.save).toHaveBeenCalled();
  });

  it('should find all farms by user_id', async () => {
    const mockFarms = [{ id: 1, name: 'Green Acres', user_id: 1 }];
    farmRepo.find.mockResolvedValue(mockFarms);

    const result = await service.findByUser(1);
    expect(farmRepo.find).toHaveBeenCalledWith({
      where: { user_id: 1 },
      relations: {
        crops: {
          crop: true,
          growth_stage: true,
        },
      },
    });
    expect(result).toEqual(mockFarms);
  });
});
