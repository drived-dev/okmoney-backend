import { Injectable, Logger } from '@nestjs/common';
import { AggregateField } from 'firebase-admin/firestore';
import { paymentCollection } from '../payment/payment.service';
import { FirebaseRepository } from '../firebase/firebase.service';
import { loanCollection } from '../loan/loan.service';
import { GetLoanByTimeDto, LoanByTimeInterval } from './dashboard.dto';

interface TimeBoundType {
  lowerBound: Date;
  upperBound: Date;
  resultTime: Date;
}

@Injectable()
export class DashboardService {
  constructor(private firebaseRepository: FirebaseRepository) {}
  logger = new Logger(DashboardService.name);

  async getDebtors(creditorId: string) {
    try {
      const queries = await Promise.all([
        this.firebaseRepository.db
          .collection(loanCollection)
          .where('creditorId', '==', creditorId)
          .get(),
        this.firebaseRepository.db
          .collection(loanCollection)
          .where('creditorId', '==', creditorId)
          .where('remainingBalance', '<=', 0)
          .get(),
      ]);

      const totalDebtors = queries[0].size;
      const clearedDebtors = queries[1].size;
      const currentDebtors = totalDebtors - clearedDebtors;

      return {
        totalDebtors,
        clearedDebtors,
        currentDebtors,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  // TODO: edit when requirement is clear, how to compute total interest?
  async getLoan(creditorId: string) {
    try {
      const querySnapshot = await this.firebaseRepository.db
        .collection(loanCollection)
        .where('creditorId', '==', creditorId)
        .aggregate({
          totalLoan: AggregateField.sum('totalBalance'),
          accuredIncome: AggregateField.sum('remainingBalance'),
          totalPrincipal: AggregateField.sum('principal'),
        })
        .get();

      const data = querySnapshot.data();
      const totalEarned = data.totalLoan - data.accuredIncome;
      const profit = Math.max(0, totalEarned - data.totalPrincipal);

      return {
        totalLoan: data.totalLoan,
        accuredIncome: data.accuredIncome,
        totalEarned,
        profit,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getLoanByTime(
    creditorId: string,
    timebound: TimeBoundType[],
    interval: LoanByTimeInterval,
  ): Promise<GetLoanByTimeDto | undefined> {
    try {
      const resolvedPrincipal = await Promise.all(
        timebound.map((time) => {
          return this.firebaseRepository.db
            .collection(loanCollection)
            .where('creditorId', '==', creditorId)
            .where('createdAt', '>=', time.lowerBound.getTime())
            .where('createdAt', '<=', time.upperBound.getTime())
            .aggregate({
              totalLoan: AggregateField.sum('totalBalance'),
            })
            .get();
        }),
      );
      const resolvedEarned = await Promise.all(
        timebound.map((time) => {
          return this.firebaseRepository.db
            .collection(paymentCollection)
            .where('creditorId', '==', creditorId)
            .where('createdAt', '>=', time.lowerBound.getTime())
            .where('createdAt', '<=', time.upperBound.getTime())
            .aggregate({
              totalEarned: AggregateField.sum('amount'),
            })
            .get();
        }),
      );
      const result = {
        totalPrincipal: 0,
        totalEarned: 0,
        data: [],
        interval,
      } as GetLoanByTimeDto;
      for (let i = 0; i < timebound.length; i++) {
        const principal = resolvedPrincipal[i].data();
        const earned = resolvedEarned[i].data();
        result.totalPrincipal += principal.totalLoan;
        result.totalEarned += earned.totalEarned;
        result.data.push({
          time: timebound[i].resultTime,
          principal: principal.totalLoan,
          earned: earned.totalEarned,
        });
      }
      return result;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getLoanYear(creditorId: string) {
    const timebound = [] as TimeBoundType[];
    for (let i = 0; i < 5; i++) {
      const year = new Date().getFullYear() - i;
      timebound.push({
        lowerBound: new Date(year, 0, 1),
        upperBound: new Date(year, 11, 31),
        resultTime: new Date(year, 0, 2),
      });
    }
    return await this.getLoanByTime(
      creditorId,
      timebound,
      LoanByTimeInterval.Year,
    );
  }

  async getLoanMonth(creditorId: string) {
    const timebound = [] as TimeBoundType[];
    for (let i = 0; i < 5; i++) {
      let month = new Date().getMonth() - i;
      let year = new Date().getFullYear();
      if (month < 0) {
        month += 12;
        year -= 1;
      }

      timebound.push({
        lowerBound: new Date(year, month, 1),
        upperBound: new Date(year, month + 1, 0),
        resultTime: new Date(year, month, 2),
      });
    }

    return await this.getLoanByTime(
      creditorId,
      timebound,
      LoanByTimeInterval.Month,
    );
  }
}
