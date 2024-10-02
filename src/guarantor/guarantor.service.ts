import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';
import { FirebaseRepository } from '../firebase/firebase.service';
import { Guarantor } from './entities/guarantor.entity';

const guarantorCollection = 'guarantor';

@Injectable()
export class GuarantorService {
  constructor(private firebaseRepository: FirebaseRepository) {}

  async create(createGuarantorDto: CreateGuarantorDto): Promise<Guarantor> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(guarantorCollection)
        .add({
          ...createGuarantorDto,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  > {
    const docRef = this.firebaseRepository.db
      .collection(guarantorCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`Guarantor with this ${id} does not exist`, {
        cause: `Guarantor with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async findAll(): Promise<Guarantor[]> {
    try {
      const snapshot = await this.firebaseRepository.db
        .collection(guarantorCollection)
        .get();
      const guarantors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return guarantors;
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
      });
    }
  }

  async findOne(id: string): Promise<Guarantor> {
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
    updateGuarantorDto: UpdateGuarantorDto,
  ): Promise<{ message: string }> {
    try {
      const docRef = await this.findById(id);

      await docRef.update({
        ...updateGuarantorDto,
        updatedAt: Date.now(),
      });
      return { message: 'Guarantor updated successfully' };
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
      return { message: 'Guarantor deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err.message,
      });
    }
  }
}
