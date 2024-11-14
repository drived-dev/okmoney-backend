import { Loan, LoanSchema } from '@/loan/entities/loan.entity';
import { loanCollection } from '@/loan/loan.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';
import { Guarantor, GuarantorSchema } from './entities/guarantor.entity';

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

  async findLoanForGuarantor(
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

  async findAll(creditorId: string): Promise<Guarantor[]> {
    const loanRef = await this.findLoanForGuarantor(creditorId);
    const guarantorDetails = await Promise.all(
      loanRef.docs.map(async (loanDoc) => {
        const loanData = LoanSchema.parse({
          id: loanDoc.id,
          ...loanDoc.data(),
        }) as Loan;

        // Fetch guarantor details
        if (!loanData.guarantorId) return;
        const guarantorRef = await this.firebaseRepository.db
          .collection(GUARANTOR_COLLECTION) // Collection where guarantors are stored
          .doc(loanData?.guarantorId)
          .get();

        if (guarantorRef.exists) {
          const guarantorData = GuarantorSchema.parse({
            id: guarantorRef.id,
            ...guarantorRef.data(),
          });
          return guarantorData; // Attach guarantor details to loan
        }
        return;
      }),
    );

    return guarantorDetails.filter((guarantor) => guarantor) as Guarantor[];
  }

  async findOne(id: string): Promise<Guarantor> {
    try {
      const docRef = await this.findById(id);
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
  ): Promise<{ message: string }> {
    try {
      const docRef = await this.findById(id);

      await docRef.update({
        ...updateGuarantorDto,
        updatedAt: Date.now(),
      });
      return { message: 'Guarantor updated successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const docRef = await this.findById(id);

      await docRef.delete();
      return { message: 'Guarantor deleted successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message, {
        cause: err?.message,
      });
    }
  }
}
