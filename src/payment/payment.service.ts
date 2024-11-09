import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentSchema } from './entities/payment.entity';

export const paymentCollection = 'payment';

@Injectable()
export class PaymentService {
  logger = new Logger(PaymentService.name);

  constructor(private firebaseRepository: FirebaseRepository) {}

  generatePaymentImagePath(loanId: string, paymentId: string) {
    return `payment/${loanId}/${paymentId}`;
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    file?: Express.Multer.File,
  ): Promise<Payment> {
    try {
      this.logger.debug(
        `Creating payment with data: ${JSON.stringify(createPaymentDto)}`,
      );
      const docRef = await this.firebaseRepository.db
        .collection(paymentCollection)
        .add({
          ...createPaymentDto,
          imageUrl: 'Not empty',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      this.logger.debug(`Payment document created with ID: ${docRef.id}`);

      const data = PaymentSchema.parse({
        id: docRef.id,
        ...(await docRef.get()).data(),
      }) as Payment;

      if (file) {
        this.logger.debug(`Uploading payment image for payment: ${docRef.id}`);
        const imageUrl = this.generatePaymentImagePath(data.loanId, docRef.id);
        await this.firebaseRepository.uploadFile(file, imageUrl);
        data.imageUrl = await this.firebaseRepository.getFileUrl(imageUrl);
        this.logger.debug(`Image uploaded successfully: ${data.imageUrl}`);
      }

      return data;
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

  async findAll(creditorId: string): Promise<Payment[]> {
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

      // get signed url for images
      const payments = await Promise.all(
        res.map(async (payment) => {
          const imageUrl = this.generatePaymentImagePath(
            payment.loanId,
            payment.id,
          );
          payment.imageUrl = await this.firebaseRepository.getFileUrl(imageUrl);
          return payment;
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
  ): Promise<Payment[]> {
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

      // get signed url for images
      const payments = await Promise.all(
        res.map(async (payment) => {
          const imageUrl = this.generatePaymentImagePath(
            payment.loanId,
            payment.id,
          );
          payment.imageUrl = await this.firebaseRepository.getFileUrl(imageUrl);
          return payment;
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

  async remove(id: string, creditorId: string) {
    const docRef = await this.findById(id);
    if (!docRef) {
      return { message: `Payment not found: ${id}` };
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
    return { message: 'Payment deleted successfully' };
  }
}
