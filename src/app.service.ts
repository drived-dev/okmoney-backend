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

  async testCron() {
    console.log("Test cron");

    const now = new Date();
    const dueDates = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime(), // 2 days before due date
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime(), // 1 day before due date
      now.getTime(), // on due date
    ];

    // Query for loans with a due date within the next 2 days
    const querySnapshot = await this.firebaseRepository.db
      .collection("loan")
      .where('dueDate', '<=', dueDates[0]) // Get loans with due dates in the next 2 days or earlier
      .get();

    if (querySnapshot.empty) {
      console.log("No loans found for notification.");
      return null;
    }

    const notifications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const loanData = doc.data();
        const { dueDate, loanStatus, debtorId } = loanData;

        // Skip if loan is closed or debtorId is missing
        if (loanStatus === "CLOSED" || !debtorId) return null;

        // Check if the loan is within the notification windows (2 days before, 1 day before, on due date, or overdue)
        if (this.shouldSendReminder(dueDate, now, dueDates)) {
          const debtorDoc = await this.firebaseRepository.db
            .collection("debtor")
            .doc(debtorId)
            .get();

          if (!debtorDoc.exists) return null;

          const phoneNumber = debtorDoc.data()?.phoneNumber ?? null;
          if (phoneNumber) {
            // Send SMS notifications based on the due date
            await this.sendReminderSms(phoneNumber, dueDate, loanStatus, now);
            return phoneNumber;
          }
        }
        return null;
      })
    );

    console.log("Notified Phone Numbers: ", notifications.filter(phone => phone != null));
    return notifications.filter(phone => phone != null);
  }

  private shouldSendReminder(dueDate: number, now: Date, dueDates: number[]): boolean {
    return (
      (dueDate === dueDates[0] && dueDate !== now.getTime()) || // 2 days before
      (dueDate === dueDates[1] && dueDate !== now.getTime()) || // 1 day before
      (dueDate === dueDates[2] && dueDate !== now.getTime()) || // on due date
      (dueDate < now.getTime()) // overdue
    );
  }

  private async sendReminderSms(phoneNumber: string, dueDate: number, loanStatus: string, now: Date) {
    let message = '';
    if (loanStatus !== "CLOSED") {
      if (dueDate === now.getTime()) {
        message = `Reminder: Loan is due today ${new Date(dueDate).toDateString()}.`;
      } else if (dueDate < now.getTime()) {
        message = `Reminder: Loan has been overdue since ${new Date(dueDate).toDateString()}.`;
      } else {
        const daysToDueDate = Math.ceil((dueDate - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysToDueDate === 2) {
          message = `Reminder: Loan will be due in 2 days on ${new Date(dueDate).toDateString()}.`;
        } else if (daysToDueDate === 1) {
          message = `Reminder: Loan will be due tomorrow (${new Date(dueDate).toDateString()}).`;
        }
      }
      await this.notificationService.sendSms(phoneNumber, message);
    }
  }

  // @Cron('0 0 * * *') // Cron job to run every day at midnight (adjust as needed)
  // async handleCron() {
  //   console.log('Cron job running at midnight to send loan reminders');
  //   await this.testCron();
  // }
}
