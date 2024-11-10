import { LoanModule } from '@/loan/loan.module';
import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { GuarantorController } from './guarantor.controller';
import { GuarantorService } from './guarantor.service';

@Module({
  imports: [FirebaseModule, LoanModule],
  controllers: [GuarantorController],
  providers: [GuarantorService],
  exports: [GuarantorService],
})
export class GuarantorModule {}
