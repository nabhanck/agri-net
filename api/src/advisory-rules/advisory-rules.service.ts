import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdvisoryRuleDto } from './dto/create-advisory-rule.dto';
import { UpdateAdvisoryRuleDto } from './dto/update-advisory-rule.dto';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { AdvisoryRule } from './entities/advisory-rule.entity';
import { Crop } from 'src/crops/entities/crop.entity';

@Injectable()
export class AdvisoryRulesService {
  constructor(
    @InjectRepository(AdvisoryRule)
    private advisoryRuleRepository: Repository<AdvisoryRule>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Crop)
    private cropRepository: Repository<Crop>,
  ) {}

  async create(createAdvisoryRuleDto: CreateAdvisoryRuleDto) {
    const {user_id, crop_id, rule_code, risk_level, risk_type, category, stage, configuration } = createAdvisoryRuleDto;

    if(!user_id) {
      throw new NotFoundException(`Please provide a valid userId`);
    }

    const user = await this.userRepository.findOne({ where: { id: user_id }});
    
    const crop = await this.cropRepository.findOne({ where: { id: crop_id }});

    if(!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    if(!crop) {
      throw new NotFoundException(`Crop with ID ${crop_id} not found`);
    }

    const newAdvisoryRule = this.advisoryRuleRepository.create({
      crop,
      rule_code,
      risk_level,
      risk_type,
      category,
      stage,
      configuration
    })

    return await this.advisoryRuleRepository.save(newAdvisoryRule);
  }

  async findAll() {
    return await this.advisoryRuleRepository.find({
      relations: {
        crop: true
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} advisoryRule`;
  }

  update(id: number, updateAdvisoryRuleDto: UpdateAdvisoryRuleDto) {
    return `This action updates a #${id} advisoryRule`;
  }

  remove(id: number) {
    return `This action removes a #${id} advisoryRule`;
  }
}
