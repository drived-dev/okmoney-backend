import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseRepository } from './firebase/firebase.service';

@Injectable()
export class AppService {
  constructor(private firebaseRepository: FirebaseRepository) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testCron(){
    console.log("Test cron")
    const date = new Date()
    date.setDate(date.getDate() - 1)
    console.log("Now ", date.getTime())

    const querySnapshot = await this.firebaseRepository.db
      .collection("loan")
      .where('dueDate', '<', date.getTime())
      .get();

    if (querySnapshot.empty) {
      console.log("none")
      return null;
    }

    const guarantorIds = querySnapshot.docs.map(doc => doc.data().guarantorId);
    console.log("Guarantor IDs:", guarantorIds);

    // Query the guarantors collection to fetch phone numbers
  const phoneNumbers = await Promise.all(
    guarantorIds.map(async (guarantorId) => {
      if (!guarantorId) {
        return null; // Return null if guarantorId is undefined or falsy
      }

      const guarantorDoc = await this.firebaseRepository.db
        .collection("guarantor")
        .doc(guarantorId)
        .get();
      
      // Return phoneNumber if the guarantor document exists, otherwise null
      return guarantorDoc.exists ? guarantorDoc.data()?.phoneNumber ?? null : null;
    })
  );

  console.log("Phone Numbers:", phoneNumbers);
  return phoneNumbers;
  }

  // @Cron('45 * * * * *')
  // handleCron() {
  //   console.log('Called when the current second is 45');
  // }
}
