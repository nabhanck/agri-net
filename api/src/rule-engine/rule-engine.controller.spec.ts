import { Test, TestingModule } from '@nestjs/testing';
import { RuleEngineController } from './rule-engine.controller';
import { RuleEngineService } from './rule-engine.service';

describe('RuleEngineController', () => {
  let controller: RuleEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuleEngineController],
      providers: [RuleEngineService],
    }).compile();

    controller = module.get<RuleEngineController>(RuleEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
