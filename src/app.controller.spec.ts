import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CreditorModule } from './creditor/creditor.module';
import { DebtorModule } from './debtor/debtor.module';
import { LoanModule } from './loan/loan.module';
import { GuarantorModule } from './guarantor/guarantor.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationModule } from './notification/notification.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
      imports: [
        ConfigModule.forRoot(),
        ScheduleModule.forRoot(),
        CreditorModule,
        DebtorModule,
        LoanModule,
        GuarantorModule,
        PaymentModule,
        AuthModule,
        DashboardModule,
        FirebaseModule,
        NotificationModule,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
