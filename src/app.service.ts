import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseRepository } from './firebase/firebase.service';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class AppService {
  constructor(private firebaseRepository: FirebaseRepository, private notificationService: NotificationService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testCron(){
    console.log("Test cron");

    const now = new Date();
    const dueDates = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime(), // 2 days before due date
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime(), // 1 day before due date
      now.getTime(), // on due date
    ];

    // Query for loans due today, 1 day before, and 2 days before
    const querySnapshot = await this.firebaseRepository.db
      .collection("loan")
      .where('dueDate', '<=', dueDates[0])
      .get();

    if (querySnapshot.empty) {
      console.log("No loans found for notification.");
      return null;
    }

    const notifications = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const loanData = doc.data();
        const dueDate = loanData.dueDate;
        const loanStatus = loanData.loanStatus;

        // Check if we are within the specified notification windows
        if (
          (dueDate === dueDates[0] && loanStatus !== "CLOSED") || // 2 days before
          (dueDate === dueDates[1] && loanStatus !== "CLOSED") || // 1 day before
          (dueDate === dueDates[2] && loanStatus !== "CLOSED") || // on due date
          (dueDate < now.getTime() && loanStatus !== "CLOSED")    // overdue
        ) {
          const guarantorId = loanData.guarantorId;
          if (!guarantorId) return null;

          const guarantorDoc = await this.firebaseRepository.db
            .collection("guarantor")
            .doc(guarantorId)
            .get();

          if (!guarantorDoc.exists) return null;

          const phoneNumber = guarantorDoc.data()?.phoneNumber ?? null;
          if (phoneNumber) {
            if( (dueDate === dueDates[0] && loanStatus !== "CLOSED") || // 2 days before
                (dueDate === dueDates[1] && loanStatus !== "CLOSED")  )
                await this.notificationService.sendSms(phoneNumber, `Reminder: Loan will be dued on ${new Date(dueDate).toDateString()}.`);
            else if(dueDate === dueDates[2] && loanStatus !== "CLOSED") await this.notificationService.sendSms(phoneNumber, `Reminder: Loan is due today ${new Date(dueDate).toDateString()}.`);
            if(dueDate < now.getTime() && loanStatus !== "CLOSED") await this.notificationService.sendSms(phoneNumber, `Reminder: Loan has been due on ${new Date(dueDate).toDateString()}.`);
            return phoneNumber;
          }
        }

        return null;
      })
    );

    console.log("Notified Phone Numbers: ", notifications.filter(phone => phone != null));
    return notifications.filter(phone => phone != null);
  }

  // @Cron('45 * * * * *')
  // handleCron() {
  //   console.log('Called when the current second is 45');
  // }
}
