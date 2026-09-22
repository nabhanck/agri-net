import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';

describe('FarmController', () => {
  let controller: FarmController;
  let service: FarmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmController],
      providers: [
        {
          provide: FarmService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUser: jest.fn(),
            findOne: jest.fn(),
            farmEvaluation: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FarmController>(FarmController);
    service = module.get<FarmService>(FarmService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findByUser on farmService', async () => {
    const mockFarms = [{ id: 1, name: 'Farm 1', user_id: 10 }];
    jest.spyOn(service, 'findByUser').mockResolvedValue(mockFarms as any);

    const result = await controller.findByUser('10');
    expect(service.findByUser).toHaveBeenCalledWith(10);
    expect(result).toEqual(mockFarms);
  });
});
