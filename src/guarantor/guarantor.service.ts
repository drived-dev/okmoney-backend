import { Loan, LoanSchema } from '../loan/entities/loan.entity';
import { loanCollection } from '../loan/loan.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';
import { Guarantor, GuarantorSchema } from './entities/guarantor.entity';
import { ResponseDto } from '../types/response.dto';

export const GUARANTOR_COLLECTION = 'guarantor';

@Injectable()
export class GuarantorService {
  constructor(private firebaseRepository: FirebaseRepository) {}

  async create(createGuarantorDto: CreateGuarantorDto): Promise<Guarantor> {
    try {
      const docRef = await this.firebaseRepository.db
        .collection(GUARANTOR_COLLECTION)
        .add({
          ...createGuarantorDto,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      const data = (await docRef.get()).data();
      return { id: docRef.id, ...data } as Guarantor;
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
      .collection(GUARANTOR_COLLECTION)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`Guarantor with this ${id} does not exist`, {
        cause: `Guarantor with this ${id} does not exist`,
      });
    }
    return docRef;
  }

  async findAllLoanByCreditorId(
    creditorId: string,
  ): Promise<
    FirebaseFirestore.QuerySnapshot<
      FirebaseFirestore.DocumentData,
      FirebaseFirestore.DocumentData
    >
  > {
    const loanRef = await this.firebaseRepository.db
      .collection(loanCollection)
      .where('creditorId', '==', creditorId)
      .where('guarantorId', '!=', null)
      .get();
    return loanRef;
  }

  async findAllGuarantorIdByCreditorId(creditorId: string): Promise<string[]> {
    const loanRef = await this.findAllLoanByCreditorId(creditorId);
    const guarantorIds = loanRef.docs.map((loanDoc) => {
      const loanData = LoanSchema.parse({
        id: loanDoc.id,
        ...loanDoc.data(),
      }) as Loan;
      return loanData.guarantorId;
    });
    return guarantorIds.filter((guarantorId) => guarantorId) as string[];
  }

  // TODO: create test for this endpoint
  async findAll(creditorId: string): Promise<Guarantor[]> {
    const guarantorIds = await this.findAllGuarantorIdByCreditorId(creditorId);
    const guarantors = await Promise.all(
      guarantorIds.map(async (guarantorId) => {
        return await this.findOne(guarantorId);
      }),
    );
    return guarantors;
  }

  async findOne(id: string): Promise<Guarantor> {
    const docRef = await this.findById(id);
    try {
      const data = (await docRef.get()).data();
      return GuarantorSchema.parse({ id: docRef.id, ...data }) as Guarantor;
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async update(
    id: string,
    updateGuarantorDto: UpdateGuarantorDto,
  ): Promise<ResponseDto> {
    const docRef = await this.findById(id);
    try {
      await docRef.update({
        ...updateGuarantorDto,
        updatedAt: Date.now(),
      });
      return { success: true, message: 'Guarantor updated successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async remove(id: string): Promise<ResponseDto> {
    const docRef = await this.findById(id);
    try {
      await docRef.delete();
      return { success: true, message: 'Guarantor deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
