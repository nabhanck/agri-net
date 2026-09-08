import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { CropGrowthService, calculateDaysElapsed } from './crop-growth.service';
import { FarmCrop } from 'src/farm_crops/entities/farm_crop.entity';
import { GrowthStage } from 'src/crops-growth-stages/entities/growth-stage.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { CROP_GROWTH_STAGE_CHANGED_EVENT } from './events/crop-growth-stage-changed.event';

describe('CropGrowthService', () => {
  let service: CropGrowthService;
  let farmCropRepo: any;
  let growthStageRepo: any;
  let cropRepo: any;
  let eventEmitter: any;

  const mockRiceCrop: Partial<Crop> = {
    id: 1,
    name: 'Rice',
    slug: 'rice',
  };

  const mockRiceStages: Partial<GrowthStage>[] = [
    { id: 1, crop_id: 1, stage_name: 'Germination', stage_order: 1, duration_days: 10 },
    { id: 2, crop_id: 1, stage_name: 'Tillering', stage_order: 2, duration_days: 25 },
    { id: 3, crop_id: 1, stage_name: 'Panicle Initiation', stage_order: 3, duration_days: 20 },
    { id: 4, crop_id: 1, stage_name: 'Flowering', stage_order: 4, duration_days: 20 },
    { id: 5, crop_id: 1, stage_name: 'Grain Filling', stage_order: 5, duration_days: 25 },
    { id: 6, crop_id: 1, stage_name: 'Maturity', stage_order: 6, duration_days: 20 },
  ];

  beforeEach(async () => {
    farmCropRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    growthStageRepo = {
      find: jest.fn().mockResolvedValue(mockRiceStages),
      findOne: jest.fn(),
    };

    cropRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropGrowthService,
        {
          provide: getRepositoryToken(FarmCrop),
          useValue: farmCropRepo,
        },
        {
          provide: getRepositoryToken(GrowthStage),
          useValue: growthStageRepo,
        },
        {
          provide: getRepositoryToken(Crop),
          useValue: cropRepo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<CropGrowthService>(CropGrowthService);
  });

  describe('calculateDaysElapsed', () => {
    it('should calculate 0 days for the same date', () => {
      const date = new Date('2026-05-01T00:00:00Z');
      expect(calculateDaysElapsed(date, date)).toBe(0);
    });

    it('should calculate 40 days elapsed correctly', () => {
      const plantingDate = new Date('2026-04-01T00:00:00Z');
      const referenceDate = new Date('2026-05-11T00:00:00Z');
      expect(calculateDaysElapsed(plantingDate, referenceDate)).toBe(40);
    });

    it('should return negative days for future planting dates', () => {
      const plantingDate = new Date('2026-05-10T00:00:00Z');
      const referenceDate = new Date('2026-05-01T00:00:00Z');
      expect(calculateDaysElapsed(plantingDate, referenceDate)).toBe(-9);
    });

    it('should return NaN for invalid dates', () => {
      expect(calculateDaysElapsed('invalid-date')).toBeNaN();
    });
  });

  describe('calculateExpectedStage', () => {
    const stages = mockRiceStages as GrowthStage[];

    it('should return null if stages array is empty or undefined', () => {
      expect(service.calculateExpectedStage([], 40)).toBeNull();
      expect(service.calculateExpectedStage(null as any, 40)).toBeNull();
    });

    it('should return the first stage for day 0 or negative days (future planting)', () => {
      expect(service.calculateExpectedStage(stages, 0)?.stage_name).toBe('Germination');
      expect(service.calculateExpectedStage(stages, -5)?.stage_name).toBe('Germination');
    });

    it('should return Germination for 0 to 10 days', () => {
      expect(service.calculateExpectedStage(stages, 1)?.stage_name).toBe('Germination');
      expect(service.calculateExpectedStage(stages, 10)?.stage_name).toBe('Germination');
    });

    it('should return Tillering for 11 to 35 days', () => {
      expect(service.calculateExpectedStage(stages, 11)?.stage_name).toBe('Tillering');
      expect(service.calculateExpectedStage(stages, 25)?.stage_name).toBe('Tillering');
      expect(service.calculateExpectedStage(stages, 35)?.stage_name).toBe('Tillering');
    });

    it('should return Panicle Initiation for 40 days (User Example: 36-55 days)', () => {
      expect(service.calculateExpectedStage(stages, 36)?.stage_name).toBe('Panicle Initiation');
      expect(service.calculateExpectedStage(stages, 40)?.stage_name).toBe('Panicle Initiation');
      expect(service.calculateExpectedStage(stages, 55)?.stage_name).toBe('Panicle Initiation');
    });

    it('should return Flowering for 56 to 75 days', () => {
      expect(service.calculateExpectedStage(stages, 56)?.stage_name).toBe('Flowering');
      expect(service.calculateExpectedStage(stages, 75)?.stage_name).toBe('Flowering');
    });

    it('should return Grain Filling for 76 to 100 days', () => {
      expect(service.calculateExpectedStage(stages, 76)?.stage_name).toBe('Grain Filling');
      expect(service.calculateExpectedStage(stages, 100)?.stage_name).toBe('Grain Filling');
    });

    it('should return Maturity for 101 to 120 days', () => {
      expect(service.calculateExpectedStage(stages, 101)?.stage_name).toBe('Maturity');
      expect(service.calculateExpectedStage(stages, 120)?.stage_name).toBe('Maturity');
    });

    it('should stay at Maturity when days exceed total duration (> 120 days)', () => {
      expect(service.calculateExpectedStage(stages, 121)?.stage_name).toBe('Maturity');
      expect(service.calculateExpectedStage(stages, 200)?.stage_name).toBe('Maturity');
    });

    it('should handle unordered stage arrays by sorting on stage_order', () => {
      const shuffled = [...stages].reverse();
      expect(service.calculateExpectedStage(shuffled, 40)?.stage_name).toBe('Panicle Initiation');
    });

    it('should safely handle stages with null or zero duration_days', () => {
      const customStages: Partial<GrowthStage>[] = [
        { id: 10, crop_id: 2, stage_name: 'Stage 1', stage_order: 1, duration_days: 0 },
        { id: 11, crop_id: 2, stage_name: 'Stage 2', stage_order: 2, duration_days: 15 },
      ];
      expect(service.calculateExpectedStage(customStages as GrowthStage[], 5)?.stage_name).toBe('Stage 2');
    });
  });

  describe('evaluateAllActiveFarmCrops', () => {
    const referenceDate = new Date('2026-05-11T00:00:00Z');

    it('should evaluate active farm crops, update changed stages, and emit events', async () => {
      const farmCrops: Partial<FarmCrop>[] = [
        {
          id: 1,
          farm_id: 10,
          crop_id: 1,
          crop: mockRiceCrop as Crop,
          planting_date: new Date('2026-04-01T00:00:00Z'), // 40 days ago -> Panicle Initiation (id: 3)
          growth_stage_id: 2, // Was Tillering (id: 2)
          growth_stage: mockRiceStages[1] as GrowthStage,
          is_active: true,
          status: 'active',
        },
        {
          id: 2,
          farm_id: 10,
          crop_id: 1,
          crop: mockRiceCrop as Crop,
          planting_date: new Date('2026-04-01T00:00:00Z'), // 40 days ago -> Panicle Initiation (id: 3)
          growth_stage_id: 3, // Already Panicle Initiation (id: 3)
          growth_stage: mockRiceStages[2] as GrowthStage,
          is_active: true,
          status: 'active',
        },
      ];

      farmCropRepo.find.mockResolvedValue(farmCrops);

      const summary = await service.evaluateAllActiveFarmCrops(referenceDate);

      expect(growthStageRepo.find).toHaveBeenCalledTimes(1); // Single batched query for stages
      expect(summary.totalActive).toBe(2);
      expect(summary.evaluated).toBe(2);
      expect(summary.updated).toBe(1);
      expect(summary.unchanged).toBe(1);
      expect(summary.skipped).toBe(0);
      expect(summary.errors).toBe(0);

      // Verify save was called for changed crop #1
      expect(farmCropRepo.save).toHaveBeenCalledTimes(1);
      expect(farmCrops[0].growth_stage_id).toBe(3);

      // Verify event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CROP_GROWTH_STAGE_CHANGED_EVENT,
        expect.objectContaining({
          farmCropId: 1,
          cropName: 'Rice',
          previousStage: expect.objectContaining({ id: 2, name: 'Tillering' }),
          newStage: expect.objectContaining({ id: 3, name: 'Panicle Initiation' }),
          daysSincePlanting: 40,
        }),
      );
    });

    it('should initialize growth_stage_id when existing growth_stage_id is null', async () => {
      const farmCrop: Partial<FarmCrop> = {
        id: 3,
        farm_id: 10,
        crop_id: 1,
        crop: mockRiceCrop as Crop,
        planting_date: new Date('2026-05-06T00:00:00Z'), // 5 days ago -> Germination (id: 1)
        growth_stage_id: null as any,
        growth_stage: null as any,
        is_active: true,
        status: 'active',
      };

      farmCropRepo.find.mockResolvedValue([farmCrop]);

      const summary = await service.evaluateAllActiveFarmCrops(referenceDate);

      expect(summary.updated).toBe(1);
      expect(farmCrop.growth_stage_id).toBe(1);
      expect(farmCropRepo.save).toHaveBeenCalled();
    });

    it('should skip crops with missing planting_date without failing', async () => {
      const farmCrop: Partial<FarmCrop> = {
        id: 4,
        farm_id: 10,
        crop_id: 1,
        crop: mockRiceCrop as Crop,
        planting_date: null as any,
        growth_stage_id: 1,
        is_active: true,
        status: 'active',
      };

      farmCropRepo.find.mockResolvedValue([farmCrop]);

      const summary = await service.evaluateAllActiveFarmCrops(referenceDate);

      expect(summary.skipped).toBe(1);
      expect(summary.updated).toBe(0);
      expect(farmCropRepo.save).not.toHaveBeenCalled();
    });

    it('should skip crops with no growth stages configured without failing', async () => {
      const farmCrop: Partial<FarmCrop> = {
        id: 5,
        farm_id: 10,
        crop_id: 99, // Unconfigured crop
        crop: { id: 99, name: 'Barley', slug: 'barley' } as Crop,
        planting_date: new Date('2026-04-01T00:00:00Z'),
        is_active: true,
        status: 'active',
      };

      farmCropRepo.find.mockResolvedValue([farmCrop]);

      const summary = await service.evaluateAllActiveFarmCrops(referenceDate);

      expect(summary.skipped).toBe(1);
      expect(summary.results[0].skipReason).toContain('No growth stages configured');
      expect(farmCropRepo.save).not.toHaveBeenCalled();
    });

    it('should skip harvested or inactive crops', async () => {
      const farmCrops: Partial<FarmCrop>[] = [
        {
          id: 6,
          crop_id: 1,
          planting_date: new Date('2026-01-01T00:00:00Z'),
          is_active: false,
          status: 'inactive',
        },
        {
          id: 7,
          crop_id: 1,
          planting_date: new Date('2026-01-01T00:00:00Z'),
          is_active: true,
          status: 'harvested',
        },
      ];

      farmCropRepo.find.mockResolvedValue(farmCrops);

      const summary = await service.evaluateAllActiveFarmCrops(referenceDate);

      expect(summary.totalActive).toBe(0);
      expect(farmCropRepo.save).not.toHaveBeenCalled();
    });

    it('should safely catch an error on an individual crop and continue processing others', async () => {
      const farmCrops: Partial<FarmCrop>[] = [
        {
          id: 8,
          crop_id: 1,
          crop: mockRiceCrop as Crop,
          planting_date: new Date('2026-04-01T00:00:00Z'),
          growth_stage_id: 1,
          is_active: true,
          status: 'active',
        },
        {
          id: 9,
          crop_id: 1,
          crop: mockRiceCrop as Crop,
          planting_date: new Date('2026-04-01T00:00:00Z'),
          growth_stage_id: 2,
          is_active: true,
          status: 'active',
        },
      ];

      farmCropRepo.find.mockResolvedValue(farmCrops);
      // Fail on first save, succeed on second
      farmCropRepo.save
        .mockRejectedValueOnce(new Error('Database write deadlock'))
        .mockResolvedValueOnce(farmCrops[1]);

      const summary = await service.evaluateAllActiveFarmCrops(referenceDate);

      expect(summary.errors).toBe(1);
      expect(summary.updated).toBe(1);
      expect(summary.errorDetails?.[0].farmCropId).toBe(8);
      expect(summary.errorDetails?.[0].error).toContain('Database write deadlock');
    });
  });

  describe('evaluateFarmCropById', () => {
    it('should throw NotFoundException if farm crop not found', async () => {
      farmCropRepo.findOne.mockResolvedValue(null);
      await expect(service.evaluateFarmCropById(999)).rejects.toThrow(NotFoundException);
    });

    it('should preview growth stage without persisting if persist: false', async () => {
      const farmCrop: Partial<FarmCrop> = {
        id: 1,
        farm_id: 10,
        crop_id: 1,
        crop: mockRiceCrop as Crop,
        planting_date: new Date('2026-04-01T00:00:00Z'),
        growth_stage_id: 1,
        growth_stage: mockRiceStages[0] as GrowthStage,
        is_active: true,
        status: 'active',
      };

      farmCropRepo.findOne.mockResolvedValue(farmCrop);
      growthStageRepo.find.mockResolvedValue(mockRiceStages);

      const result = await service.evaluateFarmCropById(1, {
        persist: false,
        referenceDate: new Date('2026-05-11T00:00:00Z'),
      });

      expect(result.newStage?.name).toBe('Panicle Initiation');
      expect(result.changed).toBe(true);
      expect(farmCropRepo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
