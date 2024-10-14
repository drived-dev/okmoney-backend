import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { Loan } from './entities/loan.entity';
import { UpdateLoanDto } from './dto/update-loan.dto';

export const loanCollection = 'loan';

// TODO: handle update via nest admin
@Injectable()
export class LoanService {
  constructor(private firebaseRepository: FirebaseRepository) {}

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

  async findByIdWithData(id: string): Promise<Loan> {
    const docRef = this.firebaseRepository.db
      .collection(loanCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`Loan with this ${id} does not exist`, {
        cause: `Loan with this ${id} does not exist`,
      });
    }
    const data = doc.data();
    return data as Loan;
  }

  async findAllByUserId(id: string): Promise<Loan[]> {
    try {
      const loansSnapshot = await this.firebaseRepository.db
        .collection(loanCollection)
        .where('creditorId', '==', id)
        .get();

      const loans = loansSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Loan,
      );
      return loans;
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async update(
    loanId: string,
    updateLoanDto: UpdateLoanDto,
  ): Promise<{ message: string }> {
    try {
      const docRef = await this.findById(loanId);

      await docRef.update({
        ...updateLoanDto,
        updatedAt: Date.now(),
      });
      return { message: 'Updated successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
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
