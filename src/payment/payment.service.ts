import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

const paymentCollection = 'payment';

@Injectable()
export class PaymentService {
  logger = new Logger(PaymentService.name);

  constructor(private firebaseRepository: FirebaseRepository) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    file?: Express.Multer.File,
  ): Promise<Payment> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(paymentCollection)
        .add({
          ...createPaymentDto,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      let data = (await docRef.get()).data();

      console.log(data);
      console.log('in service!!!!!');

      if (file) {
        const imageUrl = `payment/${createPaymentDto.loanId}/${docRef.id}`;
        await this.firebaseRepository.uploadFile(file, imageUrl);

        await docRef.update({
          imageUrl,
        });

        data = (await docRef.get()).data();
      }

      return { id: docRef.id, ...data } as Payment;
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
      throw new NotFoundException(`Payment with this ${id} does not exist`, {
        cause: `Payment with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async findAll(creditorId: string): Promise<Payment[]> {
    try {
      console.log('creditorId:', creditorId);
      const snapshot = await this.firebaseRepository.db
        .collection(paymentCollection)
        .where('creditorId', '==', creditorId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async findAllByLoadId(userId: string, loanId: string): Promise<Payment[]> {
    try {
      const snapshot = await this.firebaseRepository.db
        .collection(paymentCollection)
        .where('userId', '==', userId)
        .where('loanId', '==', loanId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
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
        return { message: `Payment not found: ${id}` };
      }
      await docRef.delete();
      return { message: 'Payment deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
