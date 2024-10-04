import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { PaymentService } from './payment.service';

@Module({
  imports: [FirebaseModule],
  providers: [PaymentService],
})
export class PaymentModule {}
