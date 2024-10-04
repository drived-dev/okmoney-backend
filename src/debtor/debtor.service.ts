import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Loan } from 'src/loan/entities/loan.entity';
import { LoanService } from 'src/loan/loan.service';
import { FirebaseRepository } from '../firebase/firebase.service';
import { PaymentService } from '../payment/payment.service';
import {
  CreateDebtorDto,
  CreateExistingDebtorDto,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { Debtor } from './entities/debtor.entity';
import { PaymentType } from 'src/payment/entities/payment.entity';

const debtorCollection = 'debtor';

@Injectable()
export class DebtorService {
  constructor(
    private firebaseRepository: FirebaseRepository,
    private loanService: LoanService,
    private paymentService: PaymentService,
  ) {}

  async createWithLoan(createExistingDebtorDto: CreateExistingDebtorDto) {
    const debtor = await this.create(createExistingDebtorDto.debtor);
    let loan: Loan;
    try {
      loan = await this.loanService.create(createExistingDebtorDto.loan);
    } catch (err: any) {
      await this.remove(debtor.id);
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }

    if (createExistingDebtorDto.paidAmount === 0) return { debtor, loan };

    try {
      const payment = await this.paymentService.create({
        amount: createExistingDebtorDto.paidAmount,
        loanId: loan.id,
        paymentType: PaymentType.EXISTING,
      });
      return { debtor, loan, payment };
    } catch (err: any) {
      await this.remove(debtor.id);
      await this.loanService.remove(loan.id);
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async create(createDebtorDto: CreateDebtorDto): Promise<Debtor> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(debtorCollection)
        .add({
          ...createDebtorDto,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data } as Debtor;
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
      .collection(debtorCollection)
      .doc(id);
    const doc = await docRef.get();
    console.log('Found:', doc.exists);
    if (!doc.exists) {
      throw new NotFoundException(`Not Found: ${id} does not exist`, {
        cause: `Debtor with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async findAll(): Promise<Debtor[]> {
    try {
      const snapshot = await this.firebaseRepository.db
        .collection(debtorCollection)
        .get();
      const debtors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return debtors as Debtor[];
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async findOne(id: string): Promise<Debtor> {
    try {
      const docRef = await this.findById(id);
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data } as Debtor;
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async update(
    id: string,
    updateDebtorDto: UpdateDebtorDto,
  ): Promise<{ message: string }> {
    try {
      const docRef = await this.findById(id);

      await docRef.update({
        ...updateDebtorDto,
        updatedAt: Date.now(),
      });
      return { message: 'Updated successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const docRef = await this.findById(id);
    try {
      await docRef.delete();
      return { message: 'Deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
