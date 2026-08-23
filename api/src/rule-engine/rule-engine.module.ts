import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { RuleEngineController } from './rule-engine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleEngine } from './entities/rule-engine.entity';
import { User } from 'src/user/entities/user.entity';
import { Advisory } from 'src/advisory/entities/advisory.entity';
import { AdvisoryRulesModule } from 'src/advisory-rules/advisory-rules.module';
import { AdvisoryRule } from 'src/advisory-rules/entities/advisory-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RuleEngine, User, Advisory, AdvisoryRule]),
    AdvisoryRulesModule
  ],
  controllers: [RuleEngineController],
  providers: [RuleEngineService],
  exports: [RuleEngineService]
})
export class RuleEngineModule {}
