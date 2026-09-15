import { Test, TestingModule } from '@nestjs/testing';
import { CropsService } from './crops.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Crop } from './entities/crop.entity';
import { User } from 'src/user/entities/user.entity';

describe('CropsService', () => {
  let service: CropsService;
  let cropRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    cropRepo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((crop) => Promise.resolve({ id: 1, ...crop })),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn((dto) => Promise.resolve({ ...dto })),
    };

    userRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Admin' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropsService,
        { provide: getRepositoryToken(Crop), useValue: cropRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<CropsService>(CropsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a crop with optimal_ph_range', async () => {
    const result = await service.create({
      user_id: 1,
      name: 'Rice',
      slug: 'rice',
      optimal_ph_range: [5.5, 6.8],
    });

    expect(result).toBeDefined();
    expect(cropRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rice',
        slug: 'rice',
        optimal_ph_range: [5.5, 6.8],
      }),
    );
  });
});
