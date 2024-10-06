import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreateCreditorDto } from './dto/create-creditor.dto';
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
      throw new NotFoundException(`Not Found: ${id} does not exist`, {
        cause: `Not Found: ${id} does not exist`,
      });
    }
    return docRef;
  }

  generateProfileImagePath(id: string) {
    return 'profileImage/' + id;
  }

  async uploadProfileImage(file: Express.Multer.File, userId: string) {
    Logger.log(`Uploading file with id: ${userId}`);
    await this.firebaseRepository.bucket
      .file(this.generateProfileImagePath(userId))
      .save(file.buffer, { contentType: file.mimetype });
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
      return { id: docRef.id, ...data } as Creditor;
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
      return creditors as Creditor[];
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
      const profileImage = await this.getProfileImageById(docRef.id);
      return { id: docRef.id, ...data, profileImage } as Creditor;
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

  async getProfileImageById(id: string): Promise<string> {
    const file = this.firebaseRepository.bucket.file(
      this.generateProfileImagePath(id),
    );
    const url = (
      await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      })
    ).toString();
    return url;
  }

  async removeProfileImageById(id: string) {
    const filePath = this.generateProfileImagePath(id);
    const isExist = await this.firebaseRepository.bucket
      .file(filePath)
      .exists();
    if (isExist[0] === true) {
      Logger.log(`Deleting file with filePath: ${filePath}`);
      await this.firebaseRepository.bucket.file(filePath).delete();
    }
  }

  async remove(id: string) {
    try {
      const docRef = await this.findById(id);

      await this.removeProfileImageById(id);

      await docRef.delete();
      return { message: 'Creditor deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
