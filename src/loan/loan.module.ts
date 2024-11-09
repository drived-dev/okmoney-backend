import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoanService } from './loan.service';

@Module({
  imports: [FirebaseModule],
  providers: [LoanService],
  exports: [LoanService],
})
export class LoanModule {}
