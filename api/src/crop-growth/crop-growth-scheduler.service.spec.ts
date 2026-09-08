import { Test, TestingModule } from '@nestjs/testing';
import { CropGrowthSchedulerService } from './crop-growth-scheduler.service';
import { CropGrowthService } from './crop-growth.service';
import { EvaluationSummary } from './interfaces/crop-growth.interface';

describe('CropGrowthSchedulerService', () => {
  let scheduler: CropGrowthSchedulerService;
  let cropGrowthService: any;

  const mockSummary: EvaluationSummary = {
    totalActive: 10,
    evaluated: 10,
    updated: 2,
    unchanged: 8,
    skipped: 0,
    errors: 0,
    results: [],
  };

  beforeEach(async () => {
    cropGrowthService = {
      evaluateAllActiveFarmCrops: jest.fn().mockResolvedValue(mockSummary),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropGrowthSchedulerService,
        {
          provide: CropGrowthService,
          useValue: cropGrowthService,
        },
      ],
    }).compile();

    scheduler = module.get<CropGrowthSchedulerService>(CropGrowthSchedulerService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  describe('handleDailyGrowthStageEvaluation', () => {
    it('should invoke cropGrowthService.evaluateAllActiveFarmCrops and return summary', async () => {
      const result = await scheduler.handleDailyGrowthStageEvaluation();
      expect(cropGrowthService.evaluateAllActiveFarmCrops).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSummary);
    });

    it('should catch any unexpected error from cropGrowthService without throwing', async () => {
      cropGrowthService.evaluateAllActiveFarmCrops.mockRejectedValueOnce(
        new Error('Fatal connection failure'),
      );

      const result = await scheduler.handleDailyGrowthStageEvaluation();
      expect(result).toBeNull();
    });
  });
});
