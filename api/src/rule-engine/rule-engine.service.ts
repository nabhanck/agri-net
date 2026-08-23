import { Injectable } from '@nestjs/common';
import { CreateRuleEngineDto } from './dto/create-rule-engine.dto';
import { UpdateRuleEngineDto } from './dto/update-rule-engine.dto';
import { RuleEngine } from './entities/rule-engine.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { FarmObservation } from './types/farm-observation.type';
import { AdvisoryRule } from 'src/advisory-rules/entities/advisory-rule.entity';
import { AdvisoryRulesService } from 'src/advisory-rules/advisory-rules.service';

@Injectable()
export class RuleEngineService {
  constructor(
    @InjectRepository(RuleEngine)
    private ruleEngineRepository: Repository<RuleEngine>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(AdvisoryRule)
    private advisoryRuleRepository: Repository<AdvisoryRule>,

    // private readonly advisoryRulesService: AdvisoryRulesService,
  ) {}

  private getObservationValue(
    field: string,
    observation: FarmObservation,
  ) {
    return observation[field as keyof FarmObservation];
  }

  private evaluateCondition(
    actualValue: any,
    operator: string,
    expectedValue: any,
  ): boolean {
    switch (operator) {
      case '>':
        return actualValue > expectedValue;

      case '<':
        return actualValue < expectedValue;

      case '>=':
        return actualValue >= expectedValue;

      case '<=':
        return actualValue <= expectedValue;

      case '==':
        return actualValue === expectedValue;

      case '!=':
        return actualValue !== expectedValue;

      case 'between':
        if (
          !Array.isArray(expectedValue) ||
          expectedValue.length !== 2
        ) {
          return false;
        }

        return (
          actualValue >= expectedValue[0] &&
          actualValue <= expectedValue[1]
        );

      case 'in':
        if (!Array.isArray(expectedValue)) {
          return false;
        }

        return expectedValue.includes(actualValue);

      default:
        return false;
    }
  }

  private evaluateConditions(
    conditions: Array<{
      field: string;
      operator: string;
      value: number | string | boolean | Array<string | number>;
    }>,
    observation: FarmObservation,
  ): boolean {
    return conditions.every((condition) => {
      const actualValue = this.getObservationValue(
        condition.field,
        observation,
      );

      if (actualValue === undefined || actualValue === null) {
        return false;
      }

      return this.evaluateCondition(
        actualValue,
        condition.operator,
        condition.value,
      );
    });
  }

  async evaluate(observation: FarmObservation) {
    const rules = await this.advisoryRuleRepository.find({
      relations: {
        crop: true
      }
    });

    const applicableRules = rules.filter((rule) => {
      // Crop must match
      if (rule.crop.id !== observation.cropId) {
        return false;
      }

      // Growth stage must match
      if (
        rule.stage &&
        rule.stage.toLowerCase() !== observation.growthStage.toLowerCase()
      ) {
        return false;
      }

      return true;
    });

    const triggeredRules = applicableRules.filter((rule) =>
      this.evaluateConditions(
        rule.configuration.conditions,
        observation,
      ),
    );

    return triggeredRules.map((rule) => ({
      ruleId: rule.id,
      ruleCode: rule.rule_code,
      riskLevel: rule.risk_level,
      riskType: rule.risk_type,
      category: rule.category,
      priority: rule.priority,
      message: rule.configuration.message,
    }));
  }

  create(createRuleEngineDto: CreateRuleEngineDto) {
    return 'This action adds a new ruleEngine';
  }

  findAll() {
    return `This action returns all ruleEngine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ruleEngine`;
  }

  update(id: number, updateRuleEngineDto: UpdateRuleEngineDto) {
    return `This action updates a #${id} ruleEngine`;
  }

  remove(id: number) {
    return `This action removes a #${id} ruleEngine`;
  }
}
