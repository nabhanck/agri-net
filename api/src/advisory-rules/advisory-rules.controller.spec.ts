import { Test, TestingModule } from '@nestjs/testing';
import { AdvisoryRulesController } from './advisory-rules.controller';
import { AdvisoryRulesService } from './advisory-rules.service';

describe('AdvisoryRulesController', () => {
  let controller: AdvisoryRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvisoryRulesController],
      providers: [AdvisoryRulesService],
    }).compile();

    controller = module.get<AdvisoryRulesController>(AdvisoryRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
