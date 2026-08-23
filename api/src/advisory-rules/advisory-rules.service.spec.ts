import { Test, TestingModule } from '@nestjs/testing';
import { AdvisoryRulesService } from './advisory-rules.service';

describe('AdvisoryRulesService', () => {
  let service: AdvisoryRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdvisoryRulesService],
    }).compile();

    service = module.get<AdvisoryRulesService>(AdvisoryRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
