import { Injectable } from '@nestjs/common';
import { CreateCreditorDto } from './dto/create-creditor.dto';
import { UpdateCreditorDto } from './dto/update-creditor.dto';
import { FirebaseRepository } from 'src/firebase/firebase.service';

// TODO: change collection name to singular
// TODO: add DTO
// TODO: use zod for validation
@Injectable()
export class CreditorService {
  constructor(private firebaseRepository: FirebaseRepository) {
    this.firebaseRepository.collection =
      this.firebaseRepository.db.collection('creditors');
  }

  create(createCreditorDto: CreateCreditorDto) {
    return 'This action adds a new creditor';
  }

  async findAll() {
    const snapshot = await this.firebaseRepository.db
      .collection('creditor')
      .get();
    // const snapshot = await this.firebaseRepository.collection.get();
    const creditors = snapshot.docs.map((doc) => doc.data());
    return creditors;
    // return `This action returns all creditor`;
  }

  async findOne(id: string) {
    const snapshot = await this.firebaseRepository.collection
      .doc(String(id))
      .get();
    return snapshot.data();
    // return `This action returns a #${id} creditor`;
  }

  update(id: number, updateCreditorDto: UpdateCreditorDto) {
    return `This action updates a #${id} creditor`;
  }

  remove(id: number) {
    return `This action removes a #${id} creditor`;
  }
}
