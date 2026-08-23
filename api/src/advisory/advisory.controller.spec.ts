import { Test, TestingModule } from '@nestjs/testing';
import { AdvisoryController } from './advisory.controller';
import { AdvisoryService } from './advisory.service';

describe('AdvisoryController', () => {
  let controller: AdvisoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvisoryController],
      providers: [AdvisoryService],
    }).compile();

    controller = module.get<AdvisoryController>(AdvisoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
