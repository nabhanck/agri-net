import { Test, TestingModule } from '@nestjs/testing';
import { CropsGrowthStagesController } from './crops-growth-stages.controller';
import { CropsGrowthStagesService } from './crops-growth-stages.service';

describe('CropsGrowthStagesController', () => {
  let controller: CropsGrowthStagesController;
  let service: any;

  const mockGrowthStage = {
    id: 1,
    crop_id: 1,
    stage_name: 'Germination',
    stage_order: 1,
  };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockGrowthStage),
      findAll: jest.fn().mockResolvedValue([mockGrowthStage]),
      findByCrop: jest.fn().mockResolvedValue([mockGrowthStage]),
      findOne: jest.fn().mockResolvedValue(mockGrowthStage),
      update: jest.fn().mockResolvedValue(mockGrowthStage),
      remove: jest.fn().mockResolvedValue({ message: 'Growth stage #1 removed successfully', id: 1 }),
      seedRiceGrowthStages: jest.fn().mockResolvedValue({ message: 'Seeded successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CropsGrowthStagesController],
      providers: [
        {
          provide: CropsGrowthStagesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CropsGrowthStagesController>(CropsGrowthStagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create growth stage', async () => {
    const dto = { crop_id: 1, stage_name: 'Germination', stage_order: 1 };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.data).toEqual(mockGrowthStage);
  });

  it('should find all growth stages', async () => {
    const result = await controller.findAll('1');
    expect(service.findAll).toHaveBeenCalledWith(1);
    expect(result).toEqual([mockGrowthStage]);
  });

  it('should find growth stages by crop', async () => {
    const result = await controller.findByCrop(1);
    expect(service.findByCrop).toHaveBeenCalledWith(1);
    expect(result).toEqual([mockGrowthStage]);
  });

  it('should find one growth stage', async () => {
    const result = await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockGrowthStage);
  });

  it('should update growth stage', async () => {
    const result = await controller.update(1, { stage_name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith(1, { stage_name: 'Updated' });
    expect(result.data).toEqual(mockGrowthStage);
  });

  it('should delete growth stage', async () => {
    const result = await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result.id).toBe(1);
  });

  it('should seed rice growth stages', async () => {
    const result = await controller.seedRice();
    expect(service.seedRiceGrowthStages).toHaveBeenCalled();
    expect(result.message).toBe('Seeded successfully');
  });
});
