import { Injectable } from '@nestjs/common';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';

@Injectable()
export class GuarantorService {
  create(createGuarantorDto: CreateGuarantorDto) {
    return 'This action adds a new guarantor';
  }

  findAll() {
    return `This action returns all guarantor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} guarantor`;
  }

  update(id: number, updateGuarantorDto: UpdateGuarantorDto) {
    return `This action updates a #${id} guarantor`;
  }

  remove(id: number) {
    return `This action removes a #${id} guarantor`;
  }
}
