import { Test, TestingModule } from '@nestjs/testing';
import { CropGrowthController } from './crop-growth.controller';
import { CropGrowthService } from './crop-growth.service';
import { EvaluationSummary, FarmCropEvaluationResult } from './interfaces/crop-growth.interface';

describe('CropGrowthController', () => {
  let controller: CropGrowthController;
  let cropGrowthService: any;

  const mockSummary: EvaluationSummary = {
    totalActive: 1,
    evaluated: 1,
    updated: 1,
    unchanged: 0,
    skipped: 0,
    errors: 0,
    results: [],
  };

  const mockEvaluationResult: FarmCropEvaluationResult = {
    farmCropId: 1,
    farmId: 10,
    cropId: 1,
    cropName: 'Rice',
    plantingDate: '2026-04-01',
    daysSincePlanting: 40,
    previousStage: { id: 2, name: 'Tillering' },
    newStage: { id: 3, name: 'Panicle Initiation' },
    changed: true,
    skipped: false,
  };

  beforeEach(async () => {
    cropGrowthService = {
      evaluateAllActiveFarmCrops: jest.fn().mockResolvedValue(mockSummary),
      evaluateFarmCropById: jest.fn().mockResolvedValue(mockEvaluationResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CropGrowthController],
      providers: [
        {
          provide: CropGrowthService,
          useValue: cropGrowthService,
        },
      ],
    }).compile();

    controller = module.get<CropGrowthController>(CropGrowthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('evaluateAll', () => {
    it('should trigger evaluateAllActiveFarmCrops', async () => {
      const result = await controller.evaluateAll();
      expect(cropGrowthService.evaluateAllActiveFarmCrops).toHaveBeenCalled();
      expect(result.data).toEqual(mockSummary);
    });

    it('should pass custom date when query parameter is provided', async () => {
      await controller.evaluateAll('2026-06-01');
      expect(cropGrowthService.evaluateAllActiveFarmCrops).toHaveBeenCalledWith(
        new Date('2026-06-01'),
      );
    });
  });

  describe('evaluateOne', () => {
    it('should trigger evaluateFarmCropById with persist: true', async () => {
      const result = await controller.evaluateOne(1);
      expect(cropGrowthService.evaluateFarmCropById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ persist: true }),
      );
      expect(result.data).toEqual(mockEvaluationResult);
    });
  });

  describe('previewOne', () => {
    it('should trigger evaluateFarmCropById with persist: false', async () => {
      const result = await controller.previewOne(1);
      expect(cropGrowthService.evaluateFarmCropById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ persist: false }),
      );
      expect(result.data).toEqual(mockEvaluationResult);
    });
  });
});
