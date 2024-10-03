import { Injectable } from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

// TODO: remove eslint disable
@Injectable()
export class LoanService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createLoanDto: CreateLoanDto) {
    return 'This action adds a new loan';
  }

  findAll() {
    return `This action returns all loan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} loan`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateLoanDto: UpdateLoanDto) {
    return `This action updates a #${id} loan`;
  }

  remove(id: number) {
    return `This action removes a #${id} loan`;
  }
}
