import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { FirebaseRepository } from 'src/firebase/firebase.service';
import { Loan } from './entities/loan.entity';

const loanCollection = 'loan';

// TODO: remove eslint disable
@Injectable()
export class LoanService {
  constructor(private firebaseRepository: FirebaseRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(loanCollection)
        .add({
          ...createLoanDto,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data } as Loan;
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  > {
    const docRef = this.firebaseRepository.db
      .collection(loanCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`Loan with this ${id} does not exist`, {
        cause: `Loan with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  findAll() {
    return `This action returns all loan`;
  }

  findOne(id: string) {
    return `This action returns a #${id} loan`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: string, updateLoanDto: UpdateLoanDto) {
    return `This action updates a #${id} loan`;
  }

  async remove(id: string) {
    try {
      const docRef = await this.findById(id);
      if (!docRef) {
        return { message: `Loan not found: ${id}` };
      }
      await docRef.delete();
      return { message: 'Loan deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
