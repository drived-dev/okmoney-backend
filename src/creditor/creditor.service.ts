import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreateCreditorDto } from './dto/create-creditor.dto';
import { UpdateCreditorDto } from './dto/update-creditor.dto';
import { Creditor } from './entities/creditor.entity';
import { generateOtp } from '@/utils/generateOtp';
import { NotificationService } from '../notification/notification.service';

const creditorCollection = 'creditor';

@Injectable()
export class CreditorService {
  private readonly logger = new Logger(CreditorService.name);

  constructor(
    private firebaseRepository: FirebaseRepository,
    private notificationService: NotificationService,
  ) {}

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
      throw new NotFoundException(`Not Found: ${id} does not exist`);
    }
    return docRef;
  }

  async checkPhonePass(phone: string, password: string) {
    if (!phone || !password) {
      throw new BadRequestException(
        'PhoneNumber and Password is required and cannot be empty',
      );
    }
    const querySnapshot = await this.firebaseRepository.db
      .collection(creditorCollection)
      .where('phoneNumber', '==', phone)
      .where('password', '==', password)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].ref;
  }

  async checkPhone(phone: string) {
    if (!phone) {
      throw new BadRequestException(
        'PhoneNumber is required and cannot be empty',
      );
    }
    const querySnapshot = await this.firebaseRepository.db
      .collection(creditorCollection)
      .where('phoneNumber', '==', phone)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].ref;
  }

  async checkGoogleId(googleId: string) {
    if (!googleId) {
      throw new BadRequestException('googleId is required and cannot be empty');
    }
    const querySnapshot = await this.firebaseRepository.db
      .collection(creditorCollection)
      .where('googleId', '==', googleId)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].ref;
  }

  async checkLineId(lineId: string) {
    if (!lineId) {
      throw new Error('lineId is required and cannot be empty');
    }
    const querySnapshot = await this.firebaseRepository.db
      .collection(creditorCollection)
      .where('lineId', '==', lineId)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].ref;
  }

  async checkFacebookId(facebookId: string) {
    if (!facebookId) {
      throw new Error('facebookId is required and cannot be empty');
    }
    const querySnapshot = await this.firebaseRepository.db
      .collection(creditorCollection)
      .where('facebookId', '==', facebookId)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].ref;
  }

  generateProfileImagePath(id: string) {
    return 'profileImage/' + id;
  }

  async uploadProfileImage(file: Express.Multer.File, userId: string) {
    await this.firebaseRepository.uploadFile(
      file,
      this.generateProfileImagePath(userId),
    );
  }

  async create(createCreditorDto: CreateCreditorDto): Promise<Creditor> {
    // TODO: handle email or something already exists?
    if (createCreditorDto.phoneNumber) {
      const ref = await this.checkPhone(createCreditorDto.phoneNumber);
      if (ref != null) throw new ForbiddenException('User already exist');
    }

    try {
      const docRef = await this.firebaseRepository.db
        .collection(creditorCollection)
        .add({
          ...createCreditorDto,
          useNotification: true,
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

  async createWithPhone(
    createCreditorDto: CreateCreditorDto,
  ): Promise<Creditor> {
    // TODO: handle email or something already exists?
    if (createCreditorDto.phoneNumber) {
      const ref = await this.checkPhone(createCreditorDto.phoneNumber);
      if (ref != null) throw new ForbiddenException('User already exist');
    } else throw new ForbiddenException('no phone number provided');

    const otp = generateOtp();

    try {
      this.notificationService.sendSms(
        createCreditorDto.phoneNumber,
        'This is the otp for logging in to OK Money: ' + otp,
      );
      const docRef = await this.firebaseRepository.db
        .collection(creditorCollection)
        .add({
          ...createCreditorDto,
          password: otp,
          useNotification: true,
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

  async getRolePackage(creditorId: string) {
    const creditor = await this.findOne(creditorId);
    return { id: creditorId, rolePackage: creditor.rolePackage };
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
      this.logger.error(err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  async findOne(creditorId: string): Promise<Creditor> {
    try {
      const docRef = await this.findById(creditorId);
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data } as Creditor;
    } catch (err) {
      this.logger.error(err);
      throw new NotFoundException('Creditor not found');
    }
  }

  async findOneWithProfileImage(creditorId: string): Promise<Creditor> {
    const creditor = await this.findOne(creditorId);
    const profileImage = await this.getProfileImageById(creditorId);
    return { ...creditor, profileImage } as Creditor;
  }

  async update(creditorId: string, updateCreditorDto: UpdateCreditorDto) {
    try {
      const docRef = await this.findById(creditorId);

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

  async getProfileImageById(creditorId: string): Promise<string | undefined> {
    try {
      return await this.firebaseRepository.getFileUrl(
        this.generateProfileImagePath(creditorId),
      );
    } catch (err) {
      this.logger.error(err);
      return undefined;
    }
  }

  async removeProfileImageById(creditorId: string) {
    const filePath = this.generateProfileImagePath(creditorId);
    await this.firebaseRepository.safeRemoveFile(filePath);
  }

  async remove(creditorId: string) {
    try {
      const docRef = await this.findById(creditorId);

      await this.removeProfileImageById(creditorId);

      await docRef.delete();
      return { message: 'Creditor deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
