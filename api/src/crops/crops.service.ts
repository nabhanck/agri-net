import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Crop } from './entities/crop.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private cropRepository: Repository<Crop>,

    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createCropDto: CreateCropDto) {
    const { user_id, name, slug, variety, scientific_name } = createCropDto;

    if(!user_id) {
      throw new NotFoundException(`Please provide a valid userId`);
    }
    
    const user = await this.userRepository.findOne({ where: { id: user_id }});

    if(!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const newCrop = this.cropRepository.create({
      name,
      slug,
      variety,
      scientific_name
    })

    return await this.cropRepository.save(newCrop);
  }

  findAll() {
    return this.cropRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} crop`;
  }

  async update(id: number, updateCropDto: UpdateCropDto) {
    const { user_id, name, slug, variety, scientific_name } = updateCropDto;

    if(!user_id) {
      throw new NotFoundException(`Please provide a valid userId`);
    }

    if(!id) {
      throw new NotFoundException(`Please provide a valid crop id`);
    }
    
    const user = await this.userRepository.findOne({ where: { id: user_id }});

    const cropToUpdate = await this.cropRepository.preload({
      id: id,
      name,
      slug,
      variety,
      scientific_name,
    });

    if(!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    if(!cropToUpdate) {
      throw new NotFoundException(`crop not found`);
    } 

    return this.cropRepository.save(cropToUpdate);
  }

  remove(id: number) {
    return `This action removes a #${id} crop`;
  }
}
