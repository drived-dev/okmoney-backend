import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { LoanService } from '../loan/loan.service';

@Module({
  imports: [FirebaseModule],
  providers: [PaymentService, LoanService],
  controllers: [PaymentController],
})
export class PaymentModule {}
