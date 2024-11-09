import { DebtorModule } from '@/debtor/debtor.module';
import { LoanModule } from '@/loan/loan.module';
import { forwardRef, Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [FirebaseModule, forwardRef(() => DebtorModule), LoanModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
