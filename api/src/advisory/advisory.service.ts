import { Injectable } from '@nestjs/common';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';

@Injectable()
export class AdvisoryService {
  create(createAdvisoryDto: CreateAdvisoryDto) {
    return 'This action adds a new advisory';
  }

  findAll() {
    return `This action returns all advisory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} advisory`;
  }

  update(id: number, updateAdvisoryDto: UpdateAdvisoryDto) {
    return `This action updates a #${id} advisory`;
  }

  remove(id: number) {
    return `This action removes a #${id} advisory`;
  }
}
