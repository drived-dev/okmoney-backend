import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { FirebaseRepository } from '../firebase/firebase.service';
import { Loan, LoanSchema } from '../loan/entities/loan.entity';
import { LoanService } from '../loan/loan.service';
import { PaymentType } from '../payment/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import {
  BulkCreateDebtorDto,
  CreateDebtorDto,
  CreateExistingDebtorDto,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { Debtor, DebtorSchema } from './entities/debtor.entity';

const debtorCollection = 'debtor';

@Injectable()
export class DebtorService {
  constructor(
    private firebaseRepository: FirebaseRepository,
    private loanService: LoanService,
    private paymentService: PaymentService,
  ) {}

  async createWithLoan(
    createExistingDebtorDto: CreateExistingDebtorDto,
    creditorId: string,
  ) {
    const debtor = await this.create(createExistingDebtorDto.debtor);
    let loan: Loan;
    try {
      loan = await this.loanService.create({
        ...createExistingDebtorDto.loan,
        debtorId: debtor.id,
        creditorId,
      });
    } catch (err: any) {
      await this.remove(debtor.id);
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }

    // If new debtor, return
    if (!createExistingDebtorDto?.paidAmount) return { debtor, loan };

    // Create payment for existing debtor
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

  async createBulk(
    bulkCreateDebtorDto: BulkCreateDebtorDto,
    creditorId: string,
  ) {
    const data = await Promise.all(
      bulkCreateDebtorDto.debtors.map(async (debtor) => {
        if (!debtor?.paidAmount) debtor.paidAmount = 0;
        return await this.createWithLoan(debtor, creditorId);
      }),
    );
    return data;
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
        cause: `Not Found: ${id} does not exist`,
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

  async findLoansWithDebtorDetails(id: string): Promise<any[]> {
    try {
      const loans = await this.loanService.findAllByUserId(id);

      const results = await Promise.all(
        loans.map(async (loan: Loan) => {
          const debtorSnapshot = await this.firebaseRepository.db
            .collection(debtorCollection)
            .doc(loan.debtorId)
            .get();

          const debtor = debtorSnapshot.exists
            ? { id: debtorSnapshot.id, ...debtorSnapshot.data() }
            : null;

          return {
            loan: LoanSchema.parse(loan),
            debtor: debtor ? DebtorSchema.parse(debtor) : null,
          };
        }),
      );

      return results;
    } catch (err: any) {
      if (err instanceof ZodError) {
        throw new InternalServerErrorException(err?.errors, {
          cause: err?.errors,
        });
      }
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
