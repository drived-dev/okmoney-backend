import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoanService } from './loan.service';

@Module({
  imports: [FirebaseModule],
  providers: [LoanService],
})
export class LoanModule {}
