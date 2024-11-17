import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { Loan, LoanSchema } from './entities/loan.entity';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { FieldValue } from 'firebase-admin/firestore';
import { ResponseDto } from '@/types/response.dto';
import { NotificationService } from '@/notification/notification.service';

export const loanCollection = 'loan';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(private firebaseRepository: FirebaseRepository, private notificationService: NotificationService) {}

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
      this.logger.error(`Loan with id ${id} does not exist`);
      throw new NotFoundException(`Loan with id ${id} does not exist`);
    }
    return docRef;
  }

  async findByGivenId(
    attr: string,
    id: string,
    creditorId: string,
  ): Promise<Loan[]> {
    const loanRef = await this.firebaseRepository.db
      .collection(loanCollection)
      .where(attr, '==', id)
      .where('creditorId', '==', creditorId)
      .get();
    if (loanRef.empty) {
      this.logger.error(
        `Loan with ${attr} id = ${id} that you are owner does not exist`,
      );
      throw new NotFoundException(
        `Loan with ${attr} id = ${id} that you are owner does not exist`,
      );
    }
    try {
      const loans = loanRef.docs.map((loanDoc) => {
        return LoanSchema.parse({ ...loanDoc.data(), id: loanDoc.id }) as Loan;
      }) as Loan[];
      return loans;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(err);
    }
  }

  async authorizeDebtorByCreditorId(
    debtorId: string,
    creditorId: string,
  ): Promise<Loan> {
    const loan = (
      await this.findByGivenId('debtorId', debtorId, creditorId)
    )[0];
    return loan;
  }

  async authorizeGuarantorByCreditorId(
    guarantorId: string,
    creditorId: string,
  ): Promise<Loan> {
    const loan = (
      await this.findByGivenId('guarantorId', guarantorId, creditorId)
    )[0] as Loan;
    return loan;
  }

  async authorizeLoanByCreditorId(
    loanId: string,
    creditorId: string,
  ): Promise<Loan> {
    const loan = await this.findByIdWithData(loanId);
    //  check if loan's creditor id is equal to the creditor id
    if (loan.creditorId !== creditorId) {
      this.logger.error(
        'Unauthorized to access debtor',
        'Creditor Id: ' + creditorId,
      );
      throw new UnauthorizedException('Unauthorized to access debtor');
    }
    return loan;
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
    const data = LoanSchema.parse({ ...doc.data(), id: doc.id });
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

  async payLoan(
    loanId: string,
    amount: number,
  ): Promise<{ message: string; loan: Loan }> {
    const loanData = await this.findByIdWithData(loanId);
    const loan = LoanSchema.parse(loanData) as Loan;
    const docRef = await this.findById(loanId);
    const newAmount = loan.remainingBalance - amount;
    await docRef.update({
      remainingBalance: newAmount,
      updatedAt: Date.now(),
    });
    loan.remainingBalance = newAmount;
    return { message: 'Payment successful', loan: loan };
  }

  async update(
    loanId: string,
    updateLoanDto: UpdateLoanDto | { guarantorId: FieldValue },
  ): Promise<ResponseDto> {
    try {
      const docRef = await this.findById(loanId);

      await docRef.update({
        ...updateLoanDto,
        updatedAt: Date.now(),
      });
      return { success: true, message: 'Updated successfully' };
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

  async sendReminderSmsByLoanId(loanId: string) {
    try {
      console.log(loanId)
      if (!loanId || typeof loanId !== 'string' || loanId.trim() === '') {
        this.logger.error('Invalid loanId provided.');
        throw new NotFoundException('Invalid loanId provided.');
      }

      const now = new Date();
      const querySnapshot = await this.firebaseRepository.db
        .collection(loanCollection)
        .doc(loanId)
        .get();
      
      const loanData = querySnapshot.data();
      if (!loanData) {
        this.logger.error(`Loan with id ${loanId} does not exist`);
        throw new NotFoundException(`Loan with id ${loanId} does not exist`);
      }
  
      const dueDate = loanData.dueDate;
      const loanStatus = loanData.loanStatus;
  
      // Check if dueDate is a valid date
      if (!dueDate) {
        this.logger.error(`Due date for loan with id ${loanId} is missing`);
        return { message: `Due date for loan with id ${loanId} is missing`, success: false };
      }
  
      // Calculate date differences
      const daysToDueDate = Math.ceil((dueDate - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Define the conditions for sending SMS reminders
      const shouldSendReminder = 
        (daysToDueDate === 2 && loanStatus !== "CLOSED") ||  // 2 days before
        (daysToDueDate === 1 && loanStatus !== "CLOSED") ||  // 1 day before
        (daysToDueDate === 0 && loanStatus !== "CLOSED") ||  // on due date
        (daysToDueDate < 0 && loanStatus !== "CLOSED");       // overdue
  
      if (shouldSendReminder) {
        const guarantorId = loanData.guarantorId;
        if (!guarantorId) {
          this.logger.warn(`Guarantor ID for loan with id ${loanId} is missing`);
          return { message: `Guarantor ID for loan with id ${loanId} is missing`, success: false };
        }
  
        const guarantorDoc = await this.firebaseRepository.db
          .collection("guarantor")
          .doc(guarantorId)
          .get();
  
        if (!guarantorDoc.exists) {
          this.logger.error(`Guarantor with id ${guarantorId} does not exist`);
          return { message: `Guarantor with id ${guarantorId} does not exist`, success: false };
        }
  
        const phoneNumber = guarantorDoc.data()?.phoneNumber;
        if (phoneNumber) {
          // Determine the message based on the days to due date
          let message = '';
          if (daysToDueDate === 2) {
            message = `Reminder: Loan will be due on ${new Date(dueDate).toDateString()}.`;
          } else if (daysToDueDate === 1) {
            message = `Reminder: Loan will be due tomorrow (${new Date(dueDate).toDateString()}).`;
          } else if (daysToDueDate === 0) {
            message = `Reminder: Loan is due today (${new Date(dueDate).toDateString()}).`;
          } else if (daysToDueDate < 0) {
            message = `Reminder: Loan was due on ${new Date(dueDate).toDateString()}.`;
          }
  
          // Send SMS
          await this.notificationService.sendSms(phoneNumber, message);
          return { message: "SMS sent successfully", success: true };
        } else {
          this.logger.warn(`Phone number for guarantor with id ${guarantorId} is missing`);
          return { message: `Phone number for guarantor with id ${guarantorId} is missing`, success: false };
        }
      }
    } catch (err: any) {
      this.logger.error('Error in sendReminderSmsByLoanId:', err);
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
    return { message: "unknown error", success: false };
  }
}
