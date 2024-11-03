import { Module } from '@nestjs/common';
import { GuarantorService } from './guarantor.service';
import { GuarantorController } from './guarantor.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoanService } from '@/loan/loan.service';

@Module({
  imports: [FirebaseModule],
  controllers: [GuarantorController],
  providers: [GuarantorService, LoanService],
})
export class GuarantorModule {}
