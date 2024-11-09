import { LoanModule } from '@/loan/loan.module';
import { PaymentModule } from '@/payment/payment.module';
import { forwardRef, Module } from '@nestjs/common';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';

@Module({
  imports: [FirebaseModule, forwardRef(() => PaymentModule), LoanModule],
  controllers: [DebtorController],
  providers: [DebtorService],
  exports: [DebtorService],
})
export class DebtorModule {}
