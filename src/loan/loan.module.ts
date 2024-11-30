import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoanService } from './loan.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [FirebaseModule, NotificationModule],
  providers: [LoanService],
  exports: [LoanService],
})
export class LoanModule {}
