import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DebtorModule } from './debtor/debtor.module';
import { LoanModule } from './loan/loan.module';
import { GuarantorModule } from './guarantor/guarantor.module';
import { PaymentModule } from './payment/payment.module';
import { CreditorModule } from './creditor/creditor.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
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
    FirebaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
