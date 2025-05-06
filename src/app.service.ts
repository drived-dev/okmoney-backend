import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseRepository } from './firebase/firebase.service';
import { NotificationService } from './notification/notification.service';
import { LoanStatus } from './loan/entities/loan.entity';

@Injectable()
export class AppService {
  constructor(
    private firebaseRepository: FirebaseRepository,
    private notificationService: NotificationService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testCron() {
    console.log('Test cron');

    const now = new Date();
    const dueDates = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime(), // 2 days before due date
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime(), // 1 day before due date
      now.getTime(), // on due date
    ];

    // Query for loans with a due date within the next 2 days
    const querySnapshot = await this.firebaseRepository.db
      .collection('loan')
      .where('dueDate', '<=', dueDates[0]) // Get loans with due dates in the next 2 days or earlier
      .get();

    if (querySnapshot.empty) {
      console.log('No loans found for notification.');
      return null;
    }

    const notifications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const loanData = doc.data();
        const { dueDate, loanStatus, debtorId, creditorId } = loanData;

        // Skip if loan is closed or debtorId is missing
        if (loanStatus === 'CLOSED' || !debtorId || !creditorId) return null;

        const creditorDoc = await this.firebaseRepository.db
          .collection('creditor')
          .doc(creditorId)
          .get();

        if (!creditorDoc.exists) return null;
        const useNotification = creditorDoc.data()?.useNotification ?? null;
        if (!useNotification) return null;

        // Check if the loan is within the notification windows (2 days before, 1 day before, on due date, or overdue)
        if (this.shouldSendReminder(dueDate, now, dueDates)) {
          await doc.ref.update({
            loanStatus: this.calculateLoanStatus(dueDate),
          });

          const debtorDoc = await this.firebaseRepository.db
            .collection('debtor')
            .doc(debtorId)
            .get();

          if (!debtorDoc.exists) return null;

          const phoneNumber = debtorDoc.data()?.phoneNumber ?? null;
          if (phoneNumber) {
            const smsCredit = creditorDoc.data()?.smsCredit ?? 0;
            if (smsCredit > 0) {
              await this.firebaseRepository.db
                .collection('creditor')
                .doc(creditorId)
                .update({ smsCredit: smsCredit - 1 });

              // Send SMS notifications based on the due date
              return await this.sendReminderSms(
                phoneNumber,
                dueDate,
                loanStatus,
                now,
                creditorDoc.id,
              );
            }
          }
        }
        return null;
      }),
    );

    console.log(
      'Notified Phone Numbers: ',
      notifications.filter((phone) => phone != null),
    );
    return notifications.filter((phone) => phone != null);
  }

  private calculateLoanStatus(dueDate: number): LoanStatus {
    const now = new Date();
    const daysToDueDate = Math.ceil(
      (dueDate - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // due date in range 2 days
    if (daysToDueDate <= 2 && daysToDueDate > 0) {
      return LoanStatus.DUE;
    } else if (daysToDueDate > 2) {
      return LoanStatus.UNDERDUE;
    } else {
      return LoanStatus.OVERDUE;
    }
  }

  private shouldSendReminder(
    dueDate: number,
    now: Date,
    dueDates: number[],
  ): boolean {
    return (
      (dueDate === dueDates[0] && dueDate !== now.getTime()) || // 2 days before
      (dueDate === dueDates[1] && dueDate !== now.getTime()) || // 1 day before
      (dueDate === dueDates[2] && dueDate !== now.getTime()) || // on due date
      dueDate < now.getTime() // overdue
    );
  }

  private async sendReminderSms(
    phoneNumber: string,
    dueDate: number,
    loanStatus: string,
    now: Date,
    creditorID: string,
  ) {
    let message = '';
    if (loanStatus !== 'CLOSED') {
      if (dueDate === now.getTime()) {
        message = `Reminder: Loan is due today ${new Date(dueDate).toDateString()}.`;
      } else if (dueDate < now.getTime()) {
        message = `Reminder: Loan has been overdue since ${new Date(dueDate).toDateString()}.`;
      } else {
        const daysToDueDate = Math.ceil(
          (dueDate - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysToDueDate === 2) {
          message = `Reminder: Loan will be due in 2 days on ${new Date(dueDate).toDateString()}.`;
        } else if (daysToDueDate === 1) {
          message = `Reminder: Loan will be due tomorrow (${new Date(dueDate).toDateString()}).`;
        }
      }
      await this.notificationService.sendSms(phoneNumber, message);
      console.log(`Sending SMS to ${phoneNumber} using ${creditorID} credit`);
      return `Sending SMS to ${phoneNumber} using ${creditorID} credit, ${message}`;
    }
  }

  async resetSmsCreditsForCreditors() {
    console.log('Resetting SMS credits for creditors...');

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    ).getTime();

    const querySnapshot = await this.firebaseRepository.db
      .collection('creditor')
      .get();

    if (querySnapshot.empty) {
      console.log('No creditors found.');
      return;
    }

    const updates = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const creditorData = doc.data();
        const { rolePackage, packageUpdateAt, smsCredit } = creditorData;

        if (!rolePackage || packageUpdateAt == null) return null;

        const packageUpdateTime = new Date(packageUpdateAt).getTime();

        // If the last update was more than a month ago
        if (packageUpdateTime <= oneMonthAgo) {
          let newSmsCredit = 0;

          // Determine the reset SMS credit based on the rolePackage
          switch (rolePackage) {
            case 'FREE':
              newSmsCredit = 10;
              break;
            case 'SMALL':
              newSmsCredit = 20;
              break;
            case 'MEDIUM':
              newSmsCredit = 30;
              break;
            case 'LARGE':
              newSmsCredit = 40;
              break;
            default:
              console.log(
                `Unknown rolePackage for creditor ${doc.id}: ${rolePackage}`,
              );
              return null;
          }

          // Update the SMS credit and reset the packageUpdateAt timestamp
          await this.firebaseRepository.db
            .collection('creditor')
            .doc(doc.id)
            .update({
              smsCredit: newSmsCredit,
              packageUpdateAt: Date.now(),
            });

          console.log(
            `Reset SMS credit for creditor ${doc.id} to ${newSmsCredit}`,
          );

          return { id: doc.id, newSmsCredit };
        }
        return null;
      }),
    );

    const successfulUpdates = updates.filter((update) => update != null);
    console.log(
      `Successfully reset SMS credits for ${successfulUpdates.length} creditors.`,
    );

    return successfulUpdates;
  }

  @Cron('0 12 * * *') // Cron job to run every day at midday
  async handleCron() {
    console.log('Cron job running');
    await this.testCron();
    await this.resetSmsCreditsForCreditors();
  }
}
