import { DebtorService } from '@/debtor/debtor.service';
import { FirebaseRepository } from '@/firebase/firebase.service';
import { Loan } from '@/loan/entities/loan.entity';
import { LoanService } from '@/loan/loan.service';
import { ResponseDto } from '@/types/response.dto';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreatePaymentDto,
  CreatePaymentResponseDto,
} from './dto/create-payment.dto';
import { GetPaymentDto } from './dto/get-payment.dto';
import { Payment, PaymentSchema } from './entities/payment.entity';

export const paymentCollection = 'payment';

@Injectable()
export class PaymentService {
  logger = new Logger(PaymentService.name);

  constructor(
    private firebaseRepository: FirebaseRepository,
    private loanService: LoanService,
    @Inject(forwardRef(() => DebtorService))
    private debtorService: DebtorService,
  ) {}

  generatePaymentImagePath(loanId: string, paymentId: string) {
    return `payment/${loanId}/${paymentId}`;
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    file?: Express.Multer.File,
  ): Promise<CreatePaymentResponseDto> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(paymentCollection)
        .add({
          ...createPaymentDto,
          imageUrl: 'Not empty',
          createdAt: Date.now(),
        });
      const data = PaymentSchema.parse({
        id: docRef.id,
        ...(await docRef.get()).data(),
      }) as Payment;

      if (file) {
        const imageUrl = this.generatePaymentImagePath(data.loanId, docRef.id);
        await this.firebaseRepository.uploadFile(file, imageUrl);
        data.imageUrl = await this.firebaseRepository.getFileUrl(imageUrl);
      }

      const { loan } = await this.loanService.payLoan(data.loanId, data.amount);
      return {
        payment: data,
        loan,
      };
    } catch (err: any) {
      this.logger.error(err?.message);
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
      .collection(paymentCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      this.logger.error(`Payment with this ${id} does not exist`);
      throw new NotFoundException(`Payment with this ${id} does not exist`, {
        cause: `Payment with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async injectDebtorName(
    payment: Payment | GetPaymentDto,
  ): Promise<GetPaymentDto> {
    const debtor = await this.debtorService.findOne(payment.debtorId);
    return {
      ...payment,
      debtorNickname: debtor.nickname,
    };
  }

  async injectImageUrl(
    payment: Payment | GetPaymentDto,
  ): Promise<Payment | GetPaymentDto> {
    const imageUrl = this.generatePaymentImagePath(payment.loanId, payment.id);
    payment.imageUrl = await this.firebaseRepository.getFileUrl(imageUrl);
    return payment;
  }

  async findAll(creditorId: string): Promise<GetPaymentDto[]> {
    try {
      const snapshot = await this.firebaseRepository.db
        .collection(paymentCollection)
        .where('creditorId', '==', creditorId)
        .orderBy('createdAt', 'desc')
        .get();
      const res = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];

      // get signed url for images and inject debtor names
      const payments = await Promise.all(
        res.map(async (payment) => {
          payment = await this.injectImageUrl(payment);
          payment = await this.injectDebtorName(payment);
          return payment as GetPaymentDto;
        }),
      );

      return payments;
    } catch (err: any) {
      this.logger.error(err?.message);
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async findAllByDebtorId(
    creditorId: string,
    debtorId: string,
  ): Promise<GetPaymentDto[]> {
    try {
      const snapshot = await this.firebaseRepository.db
        .collection(paymentCollection)
        .where('creditorId', '==', creditorId)
        .where('debtorId', '==', debtorId)
        .orderBy('createdAt', 'desc')
        .get();
      const res = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];

      // get signed url for images and inject debtor names
      const payments = await Promise.all(
        res.map(async (payment) => {
          payment = await this.injectImageUrl(payment);
          payment = await this.injectDebtorName(payment);
          return payment as GetPaymentDto;
        }),
      );

      return payments;
    } catch (err: any) {
      this.logger.error(err?.message);
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async remove(
    id: string,
    creditorId: string,
  ): Promise<ResponseDto & { loan?: Loan }> {
    const docRef = await this.findById(id);
    if (!docRef) {
      return { success: false, message: `Payment not found: ${id}` };
    }
    const data = PaymentSchema.parse({
      id: docRef.id,
      ...(await docRef.get()).data(),
    }) as Payment;

    if (data.creditorId !== creditorId) {
      this.logger.error(`Payment with this ${id} does not belong to you`);
      throw new UnauthorizedException(
        `Payment with this ${id} does not belong to you`,
      );
    }

    if (data.imageUrl) {
      const imagePath = this.generatePaymentImagePath(data.loanId, data.id);
      await this.firebaseRepository.safeRemoveFile(imagePath);
    }
    await docRef.delete();

    const { loan } = await this.loanService.payLoan(data.loanId, -data.amount);
    return { success: true, message: 'Payment deleted successfully', loan };
  }
}
