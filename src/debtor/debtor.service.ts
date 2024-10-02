import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { FirebaseRepository } from '../firebase/firebase.service';
import { Debtor } from './entities/debtor.entity';

const debtorCollection = 'debtor';

@Injectable()
export class DebtorService {
  constructor(private firebaseRepository: FirebaseRepository) {}

  async create(createDebtorDto: CreateDebtorDto): Promise<Debtor> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(debtorCollection)
        .add({
          ...createDebtorDto,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        {
          error: 'Fail to create new user',
        },
        { cause: err.message },
      );
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
    if (!doc.exists) {
      throw new NotFoundException(`Debtor with this ${id} does not exist`, {
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
      return debtors;
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
      });
    }
  }

  async findOne(id: string): Promise<Debtor> {
    try {
      const docRef = await this.findById(id);
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data };
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
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
        updated_at: Date.now(),
      });
      return { message: 'Debtor updated successfully' };
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const docRef = await this.findById(id);

      await docRef.delete();
      return { message: 'Debtor deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
      });
    }
  }
}
