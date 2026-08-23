import { Module } from '@nestjs/common';
import { AdvisoryRulesService } from './advisory-rules.service';
import { AdvisoryRulesController } from './advisory-rules.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { User } from 'src/user/entities/user.entity';
import { AdvisoryRule } from './entities/advisory-rule.entity';
import { Crop } from 'src/crops/entities/crop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdvisoryRule, User, Crop]),
  ],
  controllers: [AdvisoryRulesController],
  providers: [AdvisoryRulesService],
})
export class AdvisoryRulesModule {}
