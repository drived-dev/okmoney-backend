import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCreditorDto } from './dto/create-creditor.dto';
import { FirebaseRepository } from '../firebase/firebase.service';
import { UpdateCreditorDto } from './dto/update-creditor.dto';
import { Creditor } from './entities/creditor.entity';

// TODO: add logger for cause errors
@Injectable()
export class CreditorService {
  constructor(private firebaseRepository: FirebaseRepository) {
    this.firebaseRepository.collection =
      this.firebaseRepository.db.collection('creditor');
  }

  async findById(
    id: string,
  ): Promise<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  > {
    const docRef = this.firebaseRepository.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Creditor Not Found', {
        cause: `Creditor with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async create(createCreditorDto: CreateCreditorDto): Promise<Creditor> {
    // TODO: handle email or something already exists?
    try {
      const docRef = await this.firebaseRepository.collection.add({
        ...createCreditorDto,
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

  async findAll(): Promise<Creditor[]> {
    try {
      const snapshot = await this.firebaseRepository.collection.get();
      const creditors = snapshot.docs.map((doc) => doc.data());
      return creditors;
    } catch (err) {
      throw new InternalServerErrorException('Failed to find creditors', {
        cause: err.message,
      });
    }
  }

  async findOne(id: string): Promise<Creditor> {
    try {
      const docRef = await this.findById(id);
      const data = (await docRef.get()).data();
      return data;
    } catch (err) {
      throw new InternalServerErrorException('Failed to find creditor', {
        cause: err.message,
      });
    }
  }

  async update(id: string, updateCreditorDto: UpdateCreditorDto) {
    try {
      const docRef = await this.findById(id);

      await docRef.update({
        ...updateCreditorDto,
        updated_at: Date.now(),
      });
      return { message: 'Creditor updated successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to update creditor', {
        cause: err.message,
      });
    }
  }

  async remove(id: string) {
    try {
      const docRef = await this.findById(id);

      await docRef.delete();
      return { message: 'Creditor deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete creditor', {
        cause: err.message,
      });
    }
  }
}
