import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCreditorDto } from './dto/create-creditor.dto';
import { FirebaseRepository } from '../firebase/firebase.service';
import { UpdateCreditorDto } from './dto/update-creditor.dto';
import { Creditor } from './entities/creditor.entity';

const creditorCollection = 'creditor';

// TODO: add logger for cause errors
@Injectable()
export class CreditorService {
  constructor(private firebaseRepository: FirebaseRepository) {}

  async findById(
    id: string,
  ): Promise<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  > {
    const docRef = this.firebaseRepository.db
      .collection(creditorCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`Creditor with this ${id} does not exist`, {
        cause: `Creditor with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async create(createCreditorDto: CreateCreditorDto): Promise<Creditor> {
    // TODO: handle email or something already exists?
    try {
      const docRef = await this.firebaseRepository.db
        .collection(creditorCollection)
        .add({
          ...createCreditorDto,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async findAll(): Promise<Creditor[]> {
    try {
      const snapshot = await this.firebaseRepository.db
        .collection(creditorCollection)
        .get();
      const creditors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return creditors;
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async findOne(id: string): Promise<Creditor> {
    try {
      const docRef = await this.findById(id);
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async update(id: string, updateCreditorDto: UpdateCreditorDto) {
    try {
      const docRef = await this.findById(id);

      await docRef.update({
        ...updateCreditorDto,
        updatedAt: Date.now(),
      });
      return { message: 'Creditor updated successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async remove(id: string) {
    try {
      const docRef = await this.findById(id);

      await docRef.delete();
      return { message: 'Creditor deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
