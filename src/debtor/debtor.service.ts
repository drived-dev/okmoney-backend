import { Injectable } from '@nestjs/common';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';

@Injectable()
export class DebtorService {
  create(createDebtorDto: CreateDebtorDto) {
    console.log(createDebtorDto);
    return 'This action adds a new debtor';
  }

  findAll() {
    return `This action returns all debtor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debtor`;
  }

  update(id: number, updateDebtorDto: UpdateDebtorDto) {
    console.log(updateDebtorDto);
    return `This action updates a #${id} debtor`;
  }

  remove(id: number) {
    return `This action removes a #${id} debtor`;
  }
}
