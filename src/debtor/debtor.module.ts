import { Module } from '@nestjs/common';
import { DebtorService } from './debtor.service';
import { DebtorController } from './debtor.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoanService } from '../loan/loan.service';
import { PaymentService } from '../payment/payment.service';

@Module({
  imports: [FirebaseModule],
  controllers: [DebtorController],
  providers: [DebtorService, LoanService, PaymentService],
})
export class DebtorModule {}
